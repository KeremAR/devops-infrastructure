#!/bin/bash

# ArgoCD Application Deployment Script
# Usage: ./deploy.sh <repo-url> <ecr-registry> [image-tag]

set -e

REPO_URL=${1:-"https://github.com/YOUR_USERNAME/cv-project"}
ECR_REGISTRY=${2:-"YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com"}
IMAGE_TAG=${3:-"latest"}

echo "🚀 Deploying ArgoCD Applications..."
echo "Repository: $REPO_URL"
echo "ECR Registry: $ECR_REGISTRY"
echo "Image Tag: $IMAGE_TAG"

# Create or update ConfigMap with values
kubectl create configmap argocd-config -n argocd \
  --from-literal=REPO_URL="$REPO_URL" \
  --from-literal=ECR_REGISTRY="$ECR_REGISTRY" \
  --from-literal=IMAGE_TAG="$IMAGE_TAG" \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy applications using Kustomize
kubectl apply -k .

echo "✅ ArgoCD Applications deployed successfully!"
echo ""
echo "🔍 Check application status:"
echo "kubectl get applications -n argocd"
echo ""
echo "🌐 Access ArgoCD UI:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "https://localhost:8080"
