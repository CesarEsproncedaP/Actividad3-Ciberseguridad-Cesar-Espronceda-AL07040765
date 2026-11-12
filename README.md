# Actividad 3 – Ciberseguridad

Configuración segura en la nube con Terraform + LocalStack, seguridad de contenedores con Trivy y autenticación JWT en una API probada con OWASP ZAP.

## Estructura

* `fase1-terraform/`: bucket S3 simulado con cifrado AES-256 (SSE-S3) y los 4 controles de bloqueo de acceso público
* `fase2-contenedores/`: `app.js`, `Dockerfile.vulnerable` (node:14), `Dockerfile` (node:22-alpine) y los reportes de Trivy en `reportes/`
* `fase3-api/`: API con autenticación JWT (`server.js`)
* `iam/`: políticas IAM en JSON y `ejemplo-uso.md`
* `diagrama/`: diagrama de arquitectura segura `.png`

## Requisitos

* Docker y Docker Compose v2
* Terraform
* AWS CLI v2
* Cuenta gratuita de LocalStack con el plan Hobby
* Trivy
* Node.js

## Ejecución

Cada fase se ejecuta desde su carpeta.

**Fase 1**

1. Crear un archivo `.env` dentro de `fase1-terraform/` con `LOCALSTACK_AUTH_TOKEN=<tu_token>`
2. `docker compose up -d`
3. `terraform init`, `terraform validate`, `terraform plan`, `terraform apply`
4. Verificar con AWS CLI usando `--endpoint-url http://localhost:4566`

**Fase 2**

1. `docker build -f Dockerfile.vulnerable -t actividad3-app:node14 .`
2. `trivy image --severity HIGH,CRITICAL actividad3-app:node14`
3. `docker build -t actividad3-app:node22 .` y volver a escanear con Trivy

**Fase 3**

1. `npm install`
2. Definir la variable de entorno `JWT_SECRET` con una cadena larga y aleatoria
3. `node server.js` (la API queda en `http://127.0.0.1:4000`)

## Seguridad

El token de LocalStack, `.env`, `*.tfstate` y `.terraform/` están en `.gitignore`. El secreto JWT se lee de una variable de entorno y no está en el código. Los usuarios de la API son simulados. Las políticas IAM no se hacen cumplir en el plan Hobby de LocalStack.
