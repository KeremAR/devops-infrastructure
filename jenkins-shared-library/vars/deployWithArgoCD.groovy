#!/usr/bin/env groovy

def call(Map config) {
    echo "🚀 Triggering ArgoCD deployment for ${config.appName}..."

    container('argocd-cli') {
        withCredentials([string(credentialsId: 'argocd-auth-token', variable: 'ARGOCD_AUTH_TOKEN')]) {
            script {
                def serverUrl = config.serverUrl ?: "https://argocd.your-domain.com"
                def namespace = config.namespace ?: "argocd"

                sh """
                    # Login to ArgoCD
                    argocd login ${serverUrl} --auth-token \$ARGOCD_AUTH_TOKEN --insecure

                    # Update image tags in the application
                    argocd app set ${config.appName} \
                        --parameter userService.image.tag=${config.imageTag} \
                        --parameter todoService.image.tag=${config.imageTag} \
                        --parameter frontend.image.tag=${config.imageTag}

                    # Sync the application
                    argocd app sync ${config.appName} --prune

                    # Wait for sync to complete
                    argocd app wait ${config.appName} --timeout 600

                    # Get application status
                    argocd app get ${config.appName}
                """
            }
        }
    }
}
