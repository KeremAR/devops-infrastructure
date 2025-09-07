pipeline {
    agent any
    
    environment {
        AWS_DEFAULT_REGION = 'us-west-2'
        ECR_REGISTRY = '123456789012.dkr.ecr.us-west-2.amazonaws.com'
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.substring(0, 8)}"
        SONAR_PROJECT_KEY = 'todo-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                }
            }
        }
        
        stage('Static Analysis & Security') {
            parallel {
                stage('Lint Python') {
                    steps {
                        script {
                            sh '''
                                pip install flake8 black isort
                                flake8 user-service/ todo-service/ --max-line-length=88
                                black --check user-service/ todo-service/
                                isort --check-only user-service/ todo-service/
                            '''
                        }
                    }
                }
                
                stage('Lint Frontend') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci
                                npm run lint
                            '''
                        }
                    }
                }
                
                stage('Dockerfile Lint') {
                    steps {
                        sh '''
                            docker run --rm -i hadolint/hadolint < user-service/Dockerfile
                            docker run --rm -i hadolint/hadolint < todo-service/Dockerfile
                            docker run --rm -i hadolint/hadolint < frontend/Dockerfile
                        '''
                    }
                }
                
                stage('SonarQube Analysis') {
                    steps {
                        withSonarQubeEnv('SonarQube') {
                            sh '''
                                sonar-scanner \
                                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                    -Dsonar.sources=. \
                                    -Dsonar.exclusions=**/node_modules/**,**/*.test.* \
                                    -Dsonar.python.coverage.reportPaths=coverage.xml
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        sh '''
                            pip install pytest pytest-asyncio pytest-cov httpx
                            python -m pytest user-service/ todo-service/ \
                                --cov=. --cov-report=xml --cov-report=html
                        '''
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci
                                npm test -- --coverage --watchAll=false
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Images') {
            parallel {
                stage('Build User Service') {
                    steps {
                        script {
                            def userImage = docker.build("${ECR_REGISTRY}/user-service:${IMAGE_TAG}", "-f user-service/Dockerfile .")
                            docker.withRegistry("https://${ECR_REGISTRY}", 'ecr:us-west-2:aws-credentials') {
                                userImage.push()
                                userImage.push('latest')
                            }
                        }
                    }
                }
                
                stage('Build Todo Service') {
                    steps {
                        script {
                            def todoImage = docker.build("${ECR_REGISTRY}/todo-service:${IMAGE_TAG}", "-f todo-service/Dockerfile .")
                            docker.withRegistry("https://${ECR_REGISTRY}", 'ecr:us-west-2:aws-credentials') {
                                todoImage.push()
                                todoImage.push('latest')
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        script {
                            def frontendImage = docker.build("${ECR_REGISTRY}/frontend:${IMAGE_TAG}", "frontend/")
                            docker.withRegistry("https://${ECR_REGISTRY}", 'ecr:us-west-2:aws-credentials') {
                                frontendImage.push()
                                frontendImage.push('latest')
                            }
                        }
                    }
                }
            }
        }
        
        stage('Container Security Scan') {
            parallel {
                stage('Trivy Scan User Service') {
                    steps {
                        sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${ECR_REGISTRY}/user-service:${IMAGE_TAG}"
                    }
                }
                
                stage('Trivy Scan Todo Service') {
                    steps {
                        sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${ECR_REGISTRY}/todo-service:${IMAGE_TAG}"
                    }
                }
                
                stage('Trivy Scan Frontend') {
                    steps {
                        sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${ECR_REGISTRY}/frontend:${IMAGE_TAG}"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    // Update ArgoCD application with new image tags
                    sh '''
                        # Update Helm values for staging
                        yq eval ".userService.image.tag = \"${IMAGE_TAG}\"" -i helm/todo-app/values-staging.yaml
                        yq eval ".todoService.image.tag = \"${IMAGE_TAG}\"" -i helm/todo-app/values-staging.yaml
                        yq eval ".frontend.image.tag = \"${IMAGE_TAG}\"" -i helm/todo-app/values-staging.yaml
                        
                        # Commit and push changes to trigger ArgoCD
                        git config user.email "jenkins@company.com"
                        git config user.name "Jenkins CI"
                        git add helm/todo-app/values-staging.yaml
                        git commit -m "Update staging deployment to ${IMAGE_TAG}"
                        git push origin HEAD
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up
            sh 'docker system prune -f'
            
            // Archive test results
            publishTestResults testResultsPattern: '**/test-results.xml'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'htmlcov',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
        
        failure {
            emailext (
                subject: "Pipeline Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Pipeline failed. Check console output at ${env.BUILD_URL}",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}
