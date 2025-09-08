# DevOps Todo App

A modern microservices-based todo application built for demonstrating comprehensive DevOps practices including CI/CD, containerization, and Kubernetes orchestration.

## 🏗️ Architecture

### Microservices
- **User Service** (FastAPI): User authentication and management
- **Todo Service** (FastAPI): Todo CRUD operations
- **Frontend** (Next.js): Modern React-based UI with Tailwind CSS

### Infrastructure
- **Local Development:** Docker Compose for rapid development
- **Kubernetes:** Minikube (local) + AWS EKS (staging/prod) with Ingress
- **Database:** SQLite (local) + PostgreSQL RDS (staging/prod)
- **Container Registry:** Amazon ECR
- **Infrastructure as Code:** Terraform with workspaces

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

### CI Pipeline (Jenkins in EKS)
1. **Pre-commit Hooks** (Local)
   - Code linting (Black, Flake8, Isort)
   - Unit tests (pytest, Jest)
   - Fast feedback loop

2. **Build & Test** (Jenkins)
   - Docker image building with semantic versioning
   - Push to Amazon ECR
   - Unit and integration tests

3. **Deploy to Staging**
   - Helm chart deployment to EKS staging
   - PostgreSQL RDS integration
   - Automated health checks

### CD Pipeline (Jenkins + ArgoCD - Planned)
1. **Current State (Jenkins Only)**
   - Manual staging deployment via Jenkins
   - Kubernetes Ingress for traffic routing
   - Database environment switching (SQLite→PostgreSQL)

2. **Future State (ArgoCD Integration)**
   - GitOps-based continuous deployment
   - Automatic staging → production promotion
   - Blue-green deployment strategy
   - Advanced rollback capabilities

## 🛠️ Environment Management

### Current Infrastructure
```bash
# Local Development
docker-compose up --build  # SQLite database

# Staging (AWS EKS + RDS)
cd terraform/environments/staging
terraform apply -var-file="staging.tfvars"
helm upgrade --install todo-app ../../helm/todo-app -f ../../helm/todo-app/values-staging.yaml

# Production (Planned)
cd terraform/environments/prod
terraform apply -var-file="prod.tfvars"
```

### Environment Differences
| Component | Local | Staging | Production (Planned) |
|-----------|-------|---------|---------------------|
| Container Platform | Docker Compose | AWS EKS | AWS EKS |
| Database | SQLite | PostgreSQL RDS | PostgreSQL RDS |
| Node Count | N/A | 2-6 (t3.medium) | 3-10 (t3.large) |
| CI/CD | Pre-commit hooks | Jenkins in EKS | Jenkins + ArgoCD |
| Traffic Routing | Direct ports | Kubernetes Ingress | Kubernetes Ingress |

## 🏛️ Infrastructure Components

### Kubernetes Resources
- **Ingress Controller**: NGINX-based traffic routing
- **Deployments**: Scalable microservice containers
- **Services**: ClusterIP for internal service discovery
- **Secrets**: Database credentials and JWT keys
- **ConfigMaps**: Environment-specific configuration

### Infrastructure as Code
- **Terraform Modules**: Network (VPC), Compute (EKS), Data (RDS), ECR
- **Helm Charts**: Application deployment with environment-specific values
- **Jenkins**: CI/CD automation with Kubernetes dynamic agents

### Monitoring & Observability (Planned)
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard and alerting
- **ArgoCD**: GitOps deployment monitoring
- **AWS CloudWatch**: Infrastructure monitoring

### Security
- **RBAC**: Jenkins service account with cluster-admin (staging)
- **AWS IAM**: EKS node groups with required policies
- **Database Security**: RDS in private subnets with security groups
- **AWS Secrets Manager**: Database credential management

## 📊 API Documentation

### User Service Endpoints
- `POST /register` - User registration with bcrypt password hashing
- `POST /login` - JWT token-based authentication
- `GET /users/{user_id}` - Get user details (requires auth)
- `GET /admin/users` - List all users (admin endpoint)
- `POST /admin/create-admin` - Create admin user

### Todo Service Endpoints
- `GET /todos` - List user todos (requires auth)
- `POST /todos` - Create new todo (requires auth)
- `PUT /todos/{todo_id}` - Update todo (requires auth)
- `DELETE /todos/{todo_id}` - Delete todo (requires auth)
- `GET /admin/todos` - List all todos (admin endpoint)

## 🔐 Security Features

- **Authentication**: JWT-based with bcrypt password hashing
- **Authorization**: User-specific todo access and admin endpoints
- **Database**: PostgreSQL with connection pooling and prepared statements
- **Infrastructure**: Private subnets, security groups, IAM roles
- **Secrets**: AWS Secrets Manager for database credentials

## 📈 Current Status & Next Steps

### ✅ Completed
- Microservices architecture with FastAPI + Next.js
- Local development with Docker Compose
- Kubernetes deployment with Helm charts
- AWS EKS staging environment with RDS PostgreSQL
- Jenkins CI/CD pipeline with ECR integration
- Pre-commit hooks for code quality

### 🔄 In Progress
- EKS cluster Kubernetes version upgrade (1.29 → 1.30)

### ⚠️ Known Issues
- **Backend Database Layer**: Services hardcoded to SQLite, need dynamic PostgreSQL connection
- **Environment Detection**: Missing `ENVIRONMENT` variable handling in backend services
- **Database Abstraction**: No connection pooling or ORM layer for multi-environment support

### 📋 Planned
- **Backend Database Layer**: Complete PostgreSQL integration with automatic environment detection
- **ArgoCD Integration**: GitOps deployment for automated staging → production promotion
- **Production Environment**: Full AWS EKS production setup with HA configuration
- **Monitoring Stack**: Prometheus + Grafana + ArgoCD dashboards
- **Security Hardening**: Network policies, Pod Security Standards, least-privilege RBAC

## 🧪 Testing Strategy

### Pre-commit Testing (Local)
- **Linting**: Black, Flake8, Isort for Python code quality
- **Unit Tests**: pytest for backend, Jest for frontend
- **Fast Feedback**: Instant validation before code push

### CI/CD Testing (Jenkins)
- **Unit Tests**: Comprehensive test coverage with pytest-cov
- **Integration Tests**: Service-to-service API communication
- **Container Tests**: Docker build and security scanning

### Manual Testing
- **Local**: Docker Compose with SQLite
- **Staging**: EKS deployment with PostgreSQL RDS
- **API Testing**: FastAPI Swagger UI at `/docs` endpoints

## 📚 Project Resources

- [DevOps Plan](./devops-plan.md) - Original infrastructure strategy
- [Terraform README](./terraform/README.md) - Infrastructure deployment guide
- **API Documentation:**
  - Local: http://localhost:8001/docs (User Service)
  - Local: http://localhost:8002/docs (Todo Service)
  - Staging: Available via Kubernetes port-forward

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
