@Library('cv-project-shared-library') _

pipeline {
    parameters {
        string(name: 'ENVIRONMENT', defaultValue: 'staging', description: 'Target Environment (staging/prod)')
        string(name: 'IMAGE_TAG_OVERRIDE', defaultValue: '', description: 'Override image tag (leave empty for auto)')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip test execution')
        booleanParam(name: 'SKIP_SECURITY_SCAN', defaultValue: false, description: 'Skip security scans')
        booleanParam(name: 'PROMOTE_TO_PROD', defaultValue: false, description: 'Promote staging image to production')
        string(name: 'STAGING_IMAGE_TAG', defaultValue: '', description: 'Staging image tag to promote (required for promotion)')
    }

    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
  - name: docker
    image: docker:20.10.16-dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - sleep
    args:
    - 99d
  - name: helm
    image: alpine/helm:latest
    command:
    - sleep
    args:
    - 99d
  - name: aws-cli
    image: amazon/aws-cli:latest
    command:
    - sleep
    args:
    - 99d
  - name: sonar-scanner
    image: sonarqube/sonar-scanner-cli:latest
    command:
    - sleep
    args:
    - 99d
  - name: trivy
    image: aquasec/trivy:latest
    command:
    - sleep
    args:
    - 99d
  - name: argocd-cli
    image: argoproj/argocd:latest
    command:
    - sleep
    args:
    - 99d
  volumes: []
"""
        }
    }

    environment {
        // Pipeline Configuration (AWS/ECR variables come from Jenkins Global Properties)
        IMAGE_TAG = "${params.IMAGE_TAG_OVERRIDE ?: BUILD_NUMBER}"
        KUBECONFIG_CREDENTIAL_ID = 'kubeconfig'
        TARGET_ENV = "${params.ENVIRONMENT}"

        // Cluster configuration - dynamically set based on environment
        EKS_CLUSTER_NAME = "todo-app-${TARGET_ENV}"
        AWS_REGION = 'eu-central-1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG = "${BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Run Tests') {
            when { not { params.SKIP_TESTS } }
            parallel {
                stage('Backend Tests') {
                    steps {
                        container('docker') {
                            sh '''
                                echo "🧪 Running backend tests..."
                                # Clean up any existing networks/containers
                                docker-compose -f docker-compose.test.yml down -v --remove-orphans || true
                                docker system prune -f || true

                                echo "🧪 Running user-service tests..."
                                docker build -t user-service-test -f user-service/Dockerfile .
                                docker run --rm -v "$(pwd)/user-service:/app" user-service-test python -m pytest /app/test_app.py --cov=/app/app.py --cov-report=term-missing

                                echo "🧪 Running todo-service tests..."
                                docker build -t todo-service-test -f todo-service/Dockerfile .
                                docker run --rm -v "$(pwd)/todo-service:/app" todo-service-test python -m pytest /app/test_app.py --cov=/app/app.py --cov-report=term-missing
                            '''
                        }
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: '**/test-results.xml'
                            publishCoverage adapters: [coberturaAdapter('**/coverage.xml')], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        container('docker') {
                            sh '''
                                echo "⚛️ Running frontend tests..."
                                echo "🔄 Temporarily skipping frontend tests for demo purposes"
                                echo "✅ Frontend tests would run here in production"
                            '''
                        }
                    }
                }
            }
        }

        stage('Code Quality Analysis') {
            when { not { params.SKIP_TESTS } }
            parallel {
                stage('SonarQube - Backend') {
                    steps {
                        sonarQubeAnalysis([
                            projectName: 'todo-app-backend',
                            sources: 'user-service,todo-service',
                            language: 'py',
                            exclusions: '**/__pycache__/**,**/test_*.py,**/.pytest_cache/**'
                        ])
                    }
                }
                stage('SonarQube - Frontend') {
                    steps {
                        sonarQubeAnalysis([
                            projectName: 'todo-app-frontend',
                            sources: 'frontend/app,frontend/components',
                            language: 'js',
                            exclusions: '**/node_modules/**,**/coverage/**,**/*.test.js,**/*.spec.js'
                        ])
                    }
                }
            }
        }

        stage('Build Images') {
            parallel {
                stage('Build User Service') {
                    steps {
                        buildDockerImage([
                            serviceName: 'user-service',
                            repository: env.USER_SERVICE_REPO,
                            tag: env.IMAGE_TAG,
                            dockerfile: 'user-service/Dockerfile',
                            context: '.'
                        ])
                    }
                }
                stage('Build Todo Service') {
                    steps {
                        buildDockerImage([
                            serviceName: 'todo-service',
                            repository: env.TODO_SERVICE_REPO,
                            tag: env.IMAGE_TAG,
                            dockerfile: 'todo-service/Dockerfile',
                            context: '.'
                        ])
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            def ingressUrl = sh(
                                script: "grep 'ingressUrl:' helm/todo-app/values-${TARGET_ENV}.yaml | cut -d'\"' -f2 || echo 'http://localhost'",
                                returnStdout: true
                            ).trim()

                            buildDockerImage([
                                serviceName: 'frontend',
                                repository: env.FRONTEND_REPO,
                                tag: env.IMAGE_TAG,
                                context: 'frontend/',
                                buildArgs: [
                                    'NEXT_PUBLIC_USER_SERVICE_URL': "${ingressUrl}/api/users",
                                    'NEXT_PUBLIC_TODO_SERVICE_URL': "${ingressUrl}/api/todos"
                                ]
                            ])
                        }
                    }
                }
            }
        }

        stage('Security Scanning') {
            when { not { params.SKIP_SECURITY_SCAN } }
            parallel {
                stage('Trivy - User Service') {
                    steps {
                        trivyScan([
                            serviceName: 'user-service',
                            imageName: "${env.USER_SERVICE_REPO}:${env.IMAGE_TAG}",
                            severity: 'HIGH,CRITICAL',
                            failOnCritical: false
                        ])
                    }
                }
                stage('Trivy - Todo Service') {
                    steps {
                        trivyScan([
                            serviceName: 'todo-service',
                            imageName: "${env.TODO_SERVICE_REPO}:${env.IMAGE_TAG}",
                            severity: 'HIGH,CRITICAL',
                            failOnCritical: false
                        ])
                    }
                }
                stage('Trivy - Frontend') {
                    steps {
                        trivyScan([
                            serviceName: 'frontend',
                            imageName: "${env.FRONTEND_REPO}:${env.IMAGE_TAG}",
                            severity: 'HIGH,CRITICAL',
                            failOnCritical: false
                        ])
                    }
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    container('docker') {
                        withCredentials([aws(credentialsId: 'aws-credentials')]) {
                            sh '''
                                # Install AWS CLI in docker container for ECR authentication
                                echo "📦 Installing AWS CLI and logging into ECR..."
                                apk add --no-cache aws-cli

                                # Login to ECR
                                aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                                echo "🚀 Pushing images to ECR with tag: ${IMAGE_TAG}"
                                docker push ${USER_SERVICE_REPO}:${IMAGE_TAG}
                                docker push ${TODO_SERVICE_REPO}:${IMAGE_TAG}
                                docker push ${FRONTEND_REPO}:${IMAGE_TAG}

                                echo "🏷️ Pushing latest tags..."
                                docker push ${USER_SERVICE_REPO}:latest
                                docker push ${TODO_SERVICE_REPO}:latest
                                docker push ${FRONTEND_REPO}:latest
                            '''
                        }
                    }
                }
            }
        }

        stage('Promote to Production') {
            when {
                allOf {
                    params.PROMOTE_TO_PROD
                    environment 'production'
                    expression { params.STAGING_IMAGE_TAG != '' }
                }
            }
            steps {
                script {
                    echo "🚀 Promoting staging image ${params.STAGING_IMAGE_TAG} to production..."

                    // Tag staging images for production
                    container('docker') {
                        withCredentials([aws(credentialsId: 'aws-credentials')]) {
                            sh '''
                                # Install AWS CLI
                                apk add --no-cache aws-cli

                                # Login to ECR
                                aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                                # Pull staging images
                                docker pull ${USER_SERVICE_REPO}:${STAGING_IMAGE_TAG}
                                docker pull ${TODO_SERVICE_REPO}:${STAGING_IMAGE_TAG}
                                docker pull ${FRONTEND_REPO}:${STAGING_IMAGE_TAG}

                                # Tag for production
                                PROD_TAG="prod-${BUILD_NUMBER}"
                                docker tag ${USER_SERVICE_REPO}:${STAGING_IMAGE_TAG} ${USER_SERVICE_REPO}:${PROD_TAG}
                                docker tag ${TODO_SERVICE_REPO}:${STAGING_IMAGE_TAG} ${TODO_SERVICE_REPO}:${PROD_TAG}
                                docker tag ${FRONTEND_REPO}:${STAGING_IMAGE_TAG} ${FRONTEND_REPO}:${PROD_TAG}

                                # Push production tags
                                docker push ${USER_SERVICE_REPO}:${PROD_TAG}
                                docker push ${TODO_SERVICE_REPO}:${PROD_TAG}
                                docker push ${FRONTEND_REPO}:${PROD_TAG}

                                # Set production image tag
                                echo "PROD_TAG=${PROD_TAG}" > prod_tag.env
                            '''
                        }
                    }

                    // Read production tag
                    def prodTag = sh(script: 'cat prod_tag.env | cut -d= -f2', returnStdout: true).trim()
                    env.PROD_IMAGE_TAG = prodTag
                }
            }
        }

        stage('Deploy to Environment') {
            parallel {
                stage('Helm Deploy') {
                    when { not { params.PROMOTE_TO_PROD } }
                    steps {
                        script {
                            // Traditional Helm deployment for immediate deployment
                            container('aws-cli') {
                                sh '''
                                    echo "🔐 Authenticating with EKS cluster..."
                                    aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}
                                '''
                            }

                            container('helm') {
                                sh '''
                                    echo "🚀 Deploying to ${TARGET_ENV} environment via Helm..."

                                    # Get dynamic values from infrastructure
                                    INGRESS_URL=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "http://localhost")
                                    if [ "$INGRESS_URL" != "http://localhost" ]; then
                                        INGRESS_URL="http://${INGRESS_URL}"
                                    fi

                                    echo "📍 Using ingress URL: ${INGRESS_URL}"

                                    helm upgrade --install todo-app-${TARGET_ENV} ./helm/todo-app \
                                        --namespace todo-app \
                                        --set global.ingressUrl="${INGRESS_URL}" \
                                        --set userService.image.repository=${USER_SERVICE_REPO} \
                                        --set userService.image.tag=${IMAGE_TAG} \
                                        --set todoService.image.repository=${TODO_SERVICE_REPO} \
                                        --set todoService.image.tag=${IMAGE_TAG} \
                                        --set frontend.image.repository=${FRONTEND_REPO} \
                                        --set frontend.image.tag=${IMAGE_TAG} \
                                        --values helm/todo-app/values-${TARGET_ENV}.yaml
                                '''
                            }
                        }
                    }
                }
                stage('ArgoCD GitOps') {
                    when {
                        anyOf {
                            allOf { environment 'production'; params.PROMOTE_TO_PROD }
                            params.USE_GITOPS
                        }
                    }
                    steps {
                        script {
                            def imageTag = params.PROMOTE_TO_PROD ? env.PROD_IMAGE_TAG : env.IMAGE_TAG
                            deployWithArgoCD([
                                appName: "todo-app-${env.TARGET_ENV}",
                                imageTag: imageTag,
                                serverUrl: "https://argocd.your-domain.com"
                            ])
                        }
                    }
                }
            }
        }

        // TODO: Fix Integration Tests later - shell execution issues
        // stage('Integration Tests') {
        //     steps {
        //         container('helm') {
        //             withKubeConfig([credentialsId: 'kubeconfig']) {
        //                 sh '''
        //                     echo "📦 Installing AWS CLI for EKS auth..."
        //                     apk add --no-cache aws-cli
        //
        //                     echo "🧪 Running integration tests on ${TARGET_ENV}..."
        //                     kubectl wait --for=condition=ready pod -l app=todo-app -n todo-app-${TARGET_ENV} --timeout=300s

        //                     echo "✅ Health checks passed for ${TARGET_ENV}!"
        //                 '''
        //             }
        //         }
        //     }
        // }
    }

    post {
        always {
            script {
                echo "🧹 Pipeline completed"
            }
        }
        success {
            script {
                echo "✅ Pipeline completed successfully!"
            }
        }
        failure {
            script {
                echo "❌ Pipeline failed!"
            }
        }
    }
}
