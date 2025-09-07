# DevOps Todo App

A modern microservices-based todo application built for demonstrating comprehensive DevOps practices including CI/CD, containerization, and Kubernetes orchestration.

## 🏗️ Architecture

### Microservices
- **User Service** (FastAPI): User authentication and management
- **Todo Service** (FastAPI): Todo CRUD operations
- **Frontend** (Next.js): Modern React-based UI

### Infrastructure
- **Kubernetes** with Gateway API for traffic routing
- **Helm Charts** for environment-specific deployments
- **Docker** containerization
- **AWS EKS** for staging and production environments

## 🚀 Quick Start

### Local Development

1. **Start with Docker Compose:**
```bash
docker-compose up --build
```

2. **Access the application:**
- Frontend: http://localhost:3000
- User Service API: http://localhost:8001/docs
- Todo Service API: http://localhost:8002/docs

### Manual Setup

1. **Backend Services:**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start User Service
cd user-service
python app.py

# Start Todo Service (in another terminal)
cd todo-service
python app.py
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔄 DevOps Pipeline

### CI Pipeline (Jenkins)
1. **Static Analysis**
   - Code linting (Flake8, ESLint, Hadolint)
   - SonarQube quality analysis
   - Security scanning with Trivy

2. **Testing**
   - Unit tests (pytest, Jest)
   - Code coverage reporting

3. **Build & Push**
   - Docker image building
   - Push to Amazon ECR
   - Container vulnerability scanning

### CD Pipeline (ArgoCD)
1. **Staging Deployment**
   - Automatic deployment on main branch
   - Integration & E2E tests
   - Health checks

2. **Production Deployment**
   - Manual approval required
   - Blue-green deployment strategy
   - Rollback capabilities

## 🛠️ Environment Management

### Terraform Workspaces
```bash
# Development (local minikube)
terraform workspace select dev
terraform apply -var-file="dev.tfvars"

# Staging (AWS EKS)
terraform workspace select staging
terraform apply -var-file="staging.tfvars"

# Production (AWS EKS)
terraform workspace select prod
terraform apply -var-file="prod.tfvars"
```

### Helm Deployments
```bash
# Development
helm install todo-app ./helm/todo-app -f ./helm/todo-app/values-dev.yaml

# Staging
helm install todo-app ./helm/todo-app -f ./helm/todo-app/values-staging.yaml

# Production
helm install todo-app ./helm/todo-app -f ./helm/todo-app/values-prod.yaml
```

## 🏛️ Infrastructure Components

### Kubernetes Resources
- **Gateway API**: Modern ingress with advanced routing
- **Deployments**: Scalable microservice containers
- **Services**: Internal service discovery
- **Secrets**: Secure credential management
- **ConfigMaps**: Environment-specific configuration

### Monitoring & Observability
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard and alerting
- **Jaeger**: Distributed tracing
- **ELK Stack**: Centralized logging

### Security
- **RBAC**: Role-based access control
- **Network Policies**: Traffic isolation
- **Pod Security Standards**: Container security
- **AWS Secrets Manager**: Credential management

## 📊 API Documentation

### User Service Endpoints
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /users/{user_id}` - Get user details

### Todo Service Endpoints
- `GET /todos` - List user todos
- `POST /todos` - Create new todo
- `PUT /todos/{todo_id}` - Update todo
- `DELETE /todos/{todo_id}` - Delete todo

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Container image vulnerability scanning
- Network-level security policies
- Secrets management with AWS Secrets Manager

## 📈 Scalability & Performance

- Horizontal pod autoscaling
- Resource limits and requests
- Database connection pooling
- CDN integration for frontend assets
- Caching strategies

## 🧪 Testing Strategy

### Unit Tests
- Backend: pytest with async support
- Frontend: Jest with React Testing Library

### Integration Tests
- API endpoint testing
- Service-to-service communication
- Database integration

### End-to-End Tests
- User workflow automation
- Cross-browser compatibility
- Performance testing

## 📚 Additional Resources

- [DevOps Plan](./devops-plan.md) - Detailed infrastructure plan
- [API Documentation](http://localhost:8001/docs) - Interactive API docs
- [Architecture Diagrams](./docs/architecture/) - System diagrams
- [Runbooks](./docs/runbooks/) - Operational procedures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
