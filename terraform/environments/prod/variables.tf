# Production Environment Variables

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

# Network Variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# EKS Variables
variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "todo-app-prod"
}

variable "cluster_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.29"
}

variable "node_groups" {
  description = "EKS node groups configuration"
  type = map(object({
    instance_types = list(string)
    capacity_type  = string
    min_size      = number
    max_size      = number
    desired_size  = number
  }))
  default = {
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
}

# Database Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "todoapp"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "todouser"
}

# Application Variables
variable "app_image_tag" {
  description = "Application image tag"
  type        = string
  default     = "latest"
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
  default     = ""
}
