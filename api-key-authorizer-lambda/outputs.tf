output "api_key_authorizer_lambda_arn" {
    value       = aws_lambda_function.api_key_authorizer_lambda.arn
    sensitive   = false
}

output "api_key_authorizer_lambda_function_name" {
    value       = aws_lambda_function.api_key_authorizer_lambda.function_name
    sensitive   = false
}
