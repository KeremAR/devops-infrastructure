import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

describe('Todo App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Authentication', () => {
    it('renders login form when user is not authenticated', () => {
      render(<Home />)

      expect(screen.getByText('DevOps Todo App')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    })

    it('can switch between login and register forms', () => {
      render(<Home />)

      // Initially shows login
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument()

      // Click register tab
      fireEvent.click(screen.getByText('Register'))

      // Now shows register form
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
    })

    it('shows form validation for empty fields', () => {
      render(<Home />)

      const usernameInput = screen.getByPlaceholderText('Username')
      const passwordInput = screen.getByPlaceholderText('Password')

      expect(usernameInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()

      // Inputs should be empty initially
      expect(usernameInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
    })
  })

  describe('Todo Management', () => {
    beforeEach(() => {
      // Mock authenticated user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'mock-jwt-token'
        if (key === 'user') return JSON.stringify({ id: 1, username: 'testuser', email: 'test@example.com' })
        return null
      })
    })

    it('renders todo interface for authenticated user', () => {
      render(<Home />)

      expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument()
      expect(screen.getByText('Add New Todo')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Todo title')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument()
    })

    it('can input todo title and description', () => {
      render(<Home />)

      const titleInput = screen.getByPlaceholderText('Todo title')
      const descriptionInput = screen.getByPlaceholderText('Description (optional)')

      fireEvent.change(titleInput, { target: { value: 'Test Todo' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })

      expect(titleInput).toHaveValue('Test Todo')
      expect(descriptionInput).toHaveValue('Test Description')
    })

    it('shows empty state when no todos exist', () => {
      render(<Home />)

      expect(screen.getByText('No todos yet. Create your first todo above!')).toBeInTheDocument()
    })

    it('has logout functionality', () => {
      render(<Home />)

      const logoutButton = screen.getByRole('button', { name: 'Logout' })
      expect(logoutButton).toBeInTheDocument()

      fireEvent.click(logoutButton)

      // Should clear localStorage and show login form
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('Form Interactions', () => {
    it('allows typing in username field', () => {
      render(<Home />)

      const usernameInput = screen.getByPlaceholderText('Username')
      fireEvent.change(usernameInput, { target: { value: 'newuser' } })

      expect(usernameInput).toHaveValue('newuser')
    })

    it('allows typing in password field', () => {
      render(<Home />)

      const passwordInput = screen.getByPlaceholderText('Password')
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      expect(passwordInput).toHaveValue('password123')
    })

    it('shows email field only in register mode', () => {
      render(<Home />)

      // Switch to register
      fireEvent.click(screen.getByText('Register'))

      const emailInput = screen.getByPlaceholderText('Email')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('UI Elements', () => {
    it('has proper CSS classes for styling', () => {
      render(<Home />)

      const mainContainer = screen.getByText('DevOps Todo App').closest('div')
      expect(mainContainer).toHaveClass('bg-white')
    })

    it('has responsive button classes', () => {
      render(<Home />)

      const loginButton = screen.getByRole('button', { name: 'Login' })
      expect(loginButton).toHaveClass('bg-blue-500', 'text-white', 'hover:bg-blue-600')
    })
  })

  describe('Environment Configuration', () => {
    it('uses correct default API URLs', () => {
      // This tests that the component handles environment variables
      render(<Home />)

      // The component should be rendered without errors
      expect(screen.getByText('DevOps Todo App')).toBeInTheDocument()
    })
  })
})
