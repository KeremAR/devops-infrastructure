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
- Backend database integration for staging environment

### ⚠️ Known Issues
- **Backend Database Layer**: Services hardcoded to SQLite, need dynamic PostgreSQL connection
- **Environment Detection**: Missing `ENVIRONMENT` variable handling in backend services
- **Database Abstraction**: No connection pooling or ORM layer for multi-environment support

### 🔧 Infrastructure Gotchas
- **EKS StorageClass Issue**: Default `gp2` uses `WaitForFirstConsumer` causing PVC circular dependency
  - **Solution**: Use `gp2-immediate` StorageClass with `volumeBindingMode: Immediate`
  - **File**: `k8s/gp2-immediate-storageclass.yaml`
  - **Apply**: `kubectl apply -f k8s/gp2-immediate-storageclass.yaml`
- **Version Upgrades**: EKS version upgrades recreate all nodes, breaking existing workloads
  - **Lesson**: Avoid frequent version upgrades in staging; use stable versions
- **Missing app-secrets**: Backend pods fail with `CreateContainerConfigError` due to missing secret
  - **Root Cause**: Helm chart missing `app-secrets` template (only has `db-secrets`)
  - **Manual Fix**: `kubectl create secret generic app-secrets -n todo-app --from-literal=secret-key=staging-secret-key-from-aws-secrets-manager`
  - **Proper Solution**: Add `app-secrets` template to Helm chart

### 🛠️ Jenkins Setup Steps
1. **Deploy Jenkins**:
   ```bash
   kubectl create namespace jenkins
   kubectl apply -f k8s/gp2-immediate-storageclass.yaml
   kubectl apply -f k8s/jenkins-rbac.yaml
   helm install jenkins jenkins/jenkins -f k8s/jenkins-values.yaml -n jenkins
   ```

2. **Install NGINX Ingress Controller**:
   ```bash
   # Install NGINX Ingress Controller for public LoadBalancer access
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

   # Wait for LoadBalancer to get external IP
   kubectl get svc -n ingress-nginx -w

   # Get LoadBalancer URL
   kubectl get svc ingress-nginx-controller -n ingress-nginx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
   ```

3. **Access Jenkins**:
   ```bash
   # Get admin password
   kubectl exec --namespace jenkins -it svc/jenkins -c jenkins -- /bin/cat /run/secrets/additional/chart-admin-password && echo

   # Get LoadBalancer external IP
   kubectl get svc jenkins -n jenkins -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
   # Access: http://EXTERNAL-IP:8080 (admin / password-from-step-1)

   # Alternative: Port forward for local access
   kubectl port-forward svc/jenkins 8080:8080 -n jenkins
   ```

4. **Configure Jenkins Credentials**:

   **Required Plugins**: GitHub, Kubernetes CLI, AWS CLI

   **GitHub Credentials** (Personal Access Token):
   - Jenkins → Manage Jenkins → Credentials → Global
   - Add Credentials → Username with password
   - ID: `github-credentials`
   - Username: Your GitHub username
   - Password: GitHub Personal Access Token (repo, workflow scopes)

   **AWS Credentials** (ECR Access):
   - Add Credentials → AWS Credentials
   - ID: `aws-credentials`
   - Access Key ID: Your AWS Access Key
   - Secret Access Key: Your AWS Secret Key

   **Kubeconfig for EKS Access**:
   ```bash
   # Generate kubeconfig file
   aws eks update-kubeconfig --region eu-central-1 --name todo-app-staging --kubeconfig staging-kubeconfig.yaml
   ```
   - Add Credentials → Secret file
   - ID: `kubeconfig`
   - File: Upload `staging-kubeconfig.yaml`

   **Fix Node Group RBAC** (Required for Helm deployments):
   ```bash
   # Allow EKS node groups to access secrets for Helm
   kubectl create clusterrolebinding nodes-cluster-admin --clusterrole=cluster-admin --group=system:nodes
   ```

4. **Configure Jenkins Environment Variables**:

   **Global Environment Variables** (Jenkins → Manage Jenkins → Configure System):
   ```bash
   ECR_REGISTRY=168155204271.dkr.ecr.eu-central-1.amazonaws.com
   USER_SERVICE_REPO=todo-user-service
   TODO_SERVICE_REPO=todo-todo-service
   FRONTEND_REPO=todo-frontend
   AWS_DEFAULT_REGION=eu-central-1
   ```

5. **Create Pipeline Job**:
   - New Item → Pipeline
   - Job name: `todo-app-ci-cd`
   - Pipeline script from SCM
   - Repository URL: `https://github.com/KeremAR/cv-project`
   - Credentials: `github-credentials`
   - Script Path: `Jenkinsfile`

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
