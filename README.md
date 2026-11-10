   # Actividad 3 – Bucket S3 seguro con Terraform + LocalStack

   Se creó un bucket S3 simulado con Terraform sobre LocalStack, 
   con cifrado AES-256 (SSE-S3) y los 4 controles de bloqueo de acceso público. 

   ## Requisitos
   - Docker y Docker Compose v2
   - Terraform
   - AWS CLI v2
   - Cuenta gratuita de LocalStack con el plan Hobby

   ## Ejecución
   1. Crear un archivo `.env` con `LOCALSTACK_AUTH_TOKEN=<tu_token>` 
   2. `docker compose up -d`
   3. `terraform init`, `terraform validate`, `terraform plan`, `terraform apply`
   4. Verificar con AWS CLI usando `--endpoint-url http://localhost:4566`.

   ## Seguridad
   El token, `.env` y `*.tfstate` están en `.gitignore`.