# ECR Module Outputs

output "user_service_repository_url" {
  description = "URL of the user service ECR repository"
  value       = aws_ecr_repository.user_service.repository_url
}

output "todo_service_repository_url" {
  description = "URL of the todo service ECR repository"
  value       = aws_ecr_repository.todo_service.repository_url
}

output "frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_registry_id" {
  description = "Registry ID"
  value       = aws_ecr_repository.user_service.registry_id
}
