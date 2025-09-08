'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface Todo {
  id: number
  title: string
  description?: string
  completed: boolean
  user_id: number
  created_at: string
}

interface User {
  id: number
  username: string
  email: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [token, setToken] = useState<string>('')
  const [showLogin, setShowLogin] = useState(true)
  const [newTodo, setNewTodo] = useState({ title: '', description: '' })

  // Login/Register state
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: ''
  })

  const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8001'
  const TODO_SERVICE_URL = process.env.NEXT_PUBLIC_TODO_SERVICE_URL || 'http://localhost:8002'

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      fetchTodos(savedToken)
    }
  }, [])

  const fetchTodos = async (authToken: string) => {
    try {
      const response = await axios.get(`${TODO_SERVICE_URL}/todos`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      setTodos(response.data)
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    }
  }

  const login = async () => {
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/login`, {
        username: authForm.username,
        password: authForm.password
      })

      const { access_token } = response.data
      setToken(access_token)
      localStorage.setItem('token', access_token)

      // Get user info - we need to decode JWT or get user ID differently
      // For now, let's create a simple user object
      const userData = { id: 1, username: authForm.username, email: authForm.username + '@example.com' }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      fetchTodos(access_token)
    } catch (error) {
      alert('Login failed')
    }
  }

  const register = async () => {
    try {
      await axios.post(`${USER_SERVICE_URL}/register`, authForm)
      alert('Registration successful! Please login.')
      setShowLogin(true)
    } catch (error) {
      alert('Registration failed')
    }
  }

  const createTodo = async () => {
    if (!newTodo.title.trim()) return

    try {
      const response = await axios.post(`${TODO_SERVICE_URL}/todos`, newTodo, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodos([response.data, ...todos])
      setNewTodo({ title: '', description: '' })
    } catch (error) {
      alert('Failed to create todo')
    }
  }

  const toggleTodo = async (todoId: number, completed: boolean) => {
    try {
      const response = await axios.put(`${TODO_SERVICE_URL}/todos/${todoId}`,
        { completed },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTodos(todos.map(todo =>
        todo.id === todoId ? response.data : todo
      ))
    } catch (error) {
      alert('Failed to update todo')
    }
  }

  const deleteTodo = async (todoId: number) => {
    try {
      await axios.delete(`${TODO_SERVICE_URL}/todos/${todoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTodos(todos.filter(todo => todo.id !== todoId))
    } catch (error) {
      alert('Failed to delete todo')
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
    setTodos([])
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">DevOps Todo App</h1>
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 px-4 rounded-l-lg ${showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setShowLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-r-lg ${!showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setShowLogin(false)}
              >
                Register
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={authForm.username}
                onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
              />
              {!showLogin && (
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                />
              )}
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              />
              <button
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                onClick={showLogin ? login : register}
              >
                {showLogin ? 'Login' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">DevOps Todo App</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.username}!</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Create Todo Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Todo</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Todo title"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newTodo.title}
              onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
            />
            <textarea
              placeholder="Description (optional)"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              value={newTodo.description}
              onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
            />
            <button
              onClick={createTodo}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Add Todo
            </button>
          </div>
        </div>

        {/* Todos List */}
        <div className="space-y-4">
          {todos.map((todo) => (
            <div key={todo.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                      className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <h4 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </h4>
                  </div>
                  {todo.description && (
                    <p className={`text-gray-600 ml-7 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 ml-7 mt-2">
                    Created: {new Date(todo.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {todos.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No todos yet. Create your first todo above!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
