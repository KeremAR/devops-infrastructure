# Production Environment Specific Values

environment = "prod"
aws_region  = "eu-central-1"

# Network Configuration
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["eu-central-1a", "eu-central-1b", "eu-central-1c"]
private_subnets    = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# EKS Configuration
cluster_name    = "todo-app-prod"
cluster_version = "1.29"

node_groups = {
  main = {
    instance_types = ["t3.large"]
    capacity_type  = "ON_DEMAND"
    min_size      = 3
    max_size      = 10
    desired_size  = 5
  }
  spot = {
    instance_types = ["t3.medium", "t3.large"]
    capacity_type  = "SPOT"
    min_size      = 2
    max_size      = 8
    desired_size  = 3
  }
}

# Database Configuration
db_instance_class = "db.t3.small"
db_name          = "todoapp_prod"
db_username      = "todouser"

# Application Configuration
app_image_tag = "v1.0.0"
