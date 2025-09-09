#!/usr/bin/env groovy

def call(Map config) {
    echo "🛡️ Running Trivy security scan for ${config.imageName}..."

    container('trivy') {
        script {
            def severity = config.severity ?: "HIGH,CRITICAL"
            def format = config.format ?: "json"
            def outputFile = "trivy-report-${config.serviceName}.${format}"

            sh """
                # Update Trivy database
                trivy image --download-db-only

                # Run vulnerability scan
                trivy image \
                    --severity ${severity} \
                    --format ${format} \
                    --output ${outputFile} \
                    ${config.imageName}

                # Display summary
                trivy image --severity ${severity} ${config.imageName}
            """

            // Archive scan results
            archiveArtifacts artifacts: outputFile, allowEmptyArchive: false

            // Fail build if critical vulnerabilities found (optional)
            if (config.failOnCritical) {
                def criticalCount = sh(
                    script: "trivy image --severity CRITICAL --format json ${config.imageName} | jq '.Results[]?.Vulnerabilities // [] | length' | awk '{sum += \$1} END {print sum}'",
                    returnStdout: true
                ).trim()

                if (criticalCount.toInteger() > 0) {
                    error "❌ Found ${criticalCount} critical vulnerabilities in ${config.imageName}"
                }
            }
        }
    }
}
