# Terraform Infrastructure

This directory contains Terraform configurations for deploying the Todo App infrastructure on AWS.

## Structure

```
terraform/
├── environments/
│   ├── staging/     # Staging environment
│   └── prod/        # Production environment
└── modules/
    ├── network/     # VPC, subnets, NAT gateways
    ├── compute/     # EKS cluster and node groups
    └── data/        # RDS database
```

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Terraform >= 1.0** installed
3. **S3 bucket** for Terraform state storage
4. **kubectl** for Kubernetes cluster access

## Setup

### 1. Create S3 Bucket for State

```bash
aws s3 mb s3://todo-app-terraform-state --region eu-central-1
aws s3api put-bucket-versioning --bucket todo-app-terraform-state --versioning-configuration Status=Enabled
```

### 2. Deploy Staging Environment

```bash
cd environments/staging

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="staging.tfvars"

# Apply configuration
terraform apply -var-file="staging.tfvars"

# Configure kubectl
aws eks update-kubeconfig --region eu-central-1 --name todo-app-staging
```

### 3. Deploy Production Environment

```bash
cd environments/prod

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="prod.tfvars"

# Apply configuration
terraform apply -var-file="prod.tfvars"

# Configure kubectl
aws eks update-kubeconfig --region eu-central-1 --name todo-app-prod
```

## Environment Differences

| Component | Staging | Production |
|-----------|---------|------------|
| VPC CIDR | 10.1.0.0/16 | 10.0.0.0/16 |
| Node Instance | t3.medium | t3.large |
| Node Count | 2-6 (desired: 3) | 3-10 (desired: 5) |
| DB Instance | db.t3.micro | db.t3.small |
| Spot Instances | No | Yes (additional) |

## Outputs

After deployment, you'll get:
- EKS cluster endpoint
- VPC and subnet IDs
- Database endpoint (sensitive)
- Kubeconfig command

## Cleanup

```bash
# Destroy staging
cd environments/staging
terraform destroy -var-file="staging.tfvars"

# Destroy production
cd environments/prod
terraform destroy -var-file="prod.tfvars"
```

## Security Notes

- Database credentials are stored in AWS Secrets Manager
- EKS cluster logs are enabled
- All resources are tagged for cost tracking
- Private subnets for worker nodes
- Security groups restrict database access
