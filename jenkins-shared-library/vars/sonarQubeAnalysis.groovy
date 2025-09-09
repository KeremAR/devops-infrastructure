#!/usr/bin/env groovy

def call(Map config) {
    echo "🔍 Running SonarQube analysis for ${config.projectName}..."

    container('sonar-scanner') {
        withSonarQubeEnv('SonarQube') {
            script {
                def exclusions = config.exclusions ?: "**/node_modules/**,**/coverage/**,**/*.test.js,**/*.spec.py"
                def sources = config.sources ?: "."
                def language = config.language ?: "auto"

                sh """
                    sonar-scanner \
                        -Dsonar.projectKey=${config.projectName} \
                        -Dsonar.projectName="${config.projectName}" \
                        -Dsonar.projectVersion=${env.BUILD_NUMBER} \
                        -Dsonar.sources=${sources} \
                        -Dsonar.exclusions=${exclusions} \
                        -Dsonar.language=${language} \
                        ${config.extraParams ?: ""}
                """
            }
        }
    }

    // Wait for quality gate
    timeout(time: 5, unit: 'MINUTES') {
        def qg = waitForQualityGate()
        if (qg.status != 'OK') {
            error "Pipeline aborted due to quality gate failure: ${qg.status}"
        }
    }
}
