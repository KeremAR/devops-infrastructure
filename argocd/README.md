# ArgoCD GitOps Configuration

## 🚀 Deployment

### 1. Configure Values
```bash
# Set your specific values
export REPO_URL="https://github.com/YOUR_USERNAME/cv-project"
export ECR_REGISTRY="YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com"
export IMAGE_TAG="latest"
```

### 2. Deploy with Script
```bash
cd argocd/
chmod +x deploy.sh
./deploy.sh $REPO_URL $ECR_REGISTRY $IMAGE_TAG
```

### 3. Manual Deployment
```bash
# Create config
kubectl create configmap argocd-config -n argocd \
  --from-literal=REPO_URL="$REPO_URL" \
  --from-literal=ECR_REGISTRY="$ECR_REGISTRY" \
  --from-literal=IMAGE_TAG="$IMAGE_TAG"

# Deploy applications
kubectl apply -k .
```

## 🔧 Configuration Files

- `application.yaml`: ArgoCD Application definitions (parameterized)
- `kustomization.yaml`: Kustomize configuration for variable replacement
- `config.yaml`: ConfigMap template for deployment values
- `deploy.sh`: Automated deployment script
- `install.yaml`: ArgoCD installation and setup

## 📋 Features

- ✅ **Parameterized Configuration**: No hardcoded values
- ✅ **Multi-Environment**: Staging and Production apps
- ✅ **Automated Sync**: GitOps deployment automation
- ✅ **Kustomize Integration**: Dynamic value replacement
- ✅ **Security**: Template-based secret management
