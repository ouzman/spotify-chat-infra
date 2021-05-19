output "api_key_authorizer_lambda_invoke_arn" {
    value       = aws_lambda_function.api_key_authorizer_lambda.invoke_arn
    sensitive   = false
}