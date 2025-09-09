#!/usr/bin/env groovy

def call(Map config) {
    echo "🏗️ Building ${config.serviceName} image..."

    container('docker') {
        script {
            def buildArgs = ""
            if (config.buildArgs) {
                config.buildArgs.each { key, value ->
                    buildArgs += "--build-arg ${key}=\"${value}\" "
                }
            }

            sh """
                docker build -t ${config.repository}:${config.tag} ${buildArgs} ${config.dockerfile ? "-f ${config.dockerfile}" : ""} ${config.context ?: "."}
                docker tag ${config.repository}:${config.tag} ${config.repository}:latest
            """
        }
    }
}
