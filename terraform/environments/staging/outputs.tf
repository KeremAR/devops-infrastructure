# Staging Environment Outputs

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.network.vpc_cidr
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_security_group_id
}

output "node_groups" {
  description = "EKS node groups"
  value       = module.eks.node_groups
}

output "db_endpoint" {
  description = "RDS endpoint"
  value       = module.database.db_endpoint
  sensitive   = true
}

output "db_port" {
  description = "RDS port"
  value       = module.database.db_port
}

# Kubeconfig command
output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

# ECR Repository URLs
output "ecr_user_service_url" {
  description = "ECR URL for user service"
  value       = module.ecr.user_service_repository_url
}

output "ecr_todo_service_url" {
  description = "ECR URL for todo service"
  value       = module.ecr.todo_service_repository_url
}

output "ecr_frontend_url" {
  description = "ECR URL for frontend"
  value       = module.ecr.frontend_repository_url
}

output "ecr_registry_id" {
  description = "ECR Registry ID"
  value       = module.ecr.ecr_registry_id
}
