# Ejemplo de uso de las políticas IAM

Las políticas de esta carpeta se aplicarían en una cuenta real de AWS (en LocalStack con el plan gratuito no se hacen cumplir, por lo que **este ejemplo no se ejecutó**). El número de cuenta `000000000000` es el de LocalStack y se cambiaría por el de la cuenta real.

| Archivo | Qué define |
|---|---|
| `politica-iam-lectura.json` | Permisos del rol `rol-lectura-actividad3`: solo `s3:GetObject` sobre los objetos y `s3:ListBucket` sobre el bucket |
| `trust-policy-rol-lectura.json` | Solo las tareas de contenedores de ECS pueden asumir el rol |
| `politica-bucket.json` | Niega el acceso a quien no sea el rol de lectura o el de administración, y niega peticiones sin HTTPS |

## Aplicación

- El rol se crea con `trust-policy-rol-lectura.json` como política de confianza y se le adjunta `politica-iam-lectura.json`.
- La política del bucket se aplica con un recurso `aws_s3_bucket_policy` de Terraform, con dependencia del bloqueo de acceso público (`aws_s3_bucket_public_access_block`).

## Prueba desde la línea de comandos

```powershell
aws sts assume-role --role-arn arn:aws:iam::000000000000:role/rol-lectura-actividad3 --role-session-name prueba-lectura
# se exportan las credenciales temporales que devuelve (AccessKeyId, SecretAccessKey y SessionToken)
aws s3api get-object --bucket actividad3-seguro-local --key prueba.txt salida.txt
aws s3api put-object --bucket actividad3-seguro-local --key nuevo.txt --body nuevo.txt
```

## Resultado esperado

| Quién | Acción | Resultado esperado |
|---|---|---|
| Rol de lectura | GetObject sobre prueba.txt | Permitido |
| Rol de lectura | PutObject (subir un archivo) | AccessDenied: no está en su política |
| Rol de lectura | GetObject por HTTP sin cifrar | Denegado por la política del bucket |
| Otro usuario o rol de la cuenta | Cualquier acción sobre el bucket | AccessDenied por la política del bucket |
| Acceso anónimo | GetObject | Denegado (bloqueo público y política del bucket) |
