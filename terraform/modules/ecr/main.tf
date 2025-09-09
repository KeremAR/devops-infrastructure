# ECR Repositories for Container Images

# User Service ECR Repository
resource "aws_ecr_repository" "user_service" {
  name                 = "todo-user-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.environment}-user-service-ecr"
    Environment = var.environment
  }
}

# Todo Service ECR Repository
resource "aws_ecr_repository" "todo_service" {
  name                 = "todo-todo-service"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.environment}-todo-service-ecr"
    Environment = var.environment
  }
}

# Frontend ECR Repository
resource "aws_ecr_repository" "frontend" {
  name                 = "todo-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.environment}-frontend-ecr"
    Environment = var.environment
  }
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "user_service" {
  repository = aws_ecr_repository.user_service.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus = "any"
          countType = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "todo_service" {
  repository = aws_ecr_repository.todo_service.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus = "any"
          countType = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus = "any"
          countType = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
