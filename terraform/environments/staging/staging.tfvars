# Staging Environment Specific Values

environment = "staging"
aws_region  = "eu-central-1"

# Network Configuration - Minimum 2 AZ (AWS requirement) with cost optimization
vpc_cidr           = "10.1.0.0/16"
availability_zones = ["eu-central-1a", "eu-central-1b"]
private_subnets    = ["10.1.1.0/24", "10.1.2.0/24"]
public_subnets     = ["10.1.101.0/24", "10.1.102.0/24"]

# EKS Configuration
cluster_name    = "todo-app-staging"
cluster_version = "1.32"

node_groups = {
  main = {
    instance_types = ["t3.medium"]
    capacity_type  = "ON_DEMAND"
    min_size      = 1
    max_size      = 3
    desired_size  = 2
  }
}

# Database Configuration
db_instance_class = "db.t3.micro"
db_name          = "todoapp_staging"
db_username      = "todouser"

# Application Configuration
app_image_tag = "staging-latest"
