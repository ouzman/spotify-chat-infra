output "auth_lambda_arn" {
    value       = aws_lambda_function.auth_lambda.arn
    sensitive   = false
}

output "auth_lambda_function_name" {
    value       = aws_lambda_function.auth_lambda.function_name
    sensitive   = false
}
