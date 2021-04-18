output "auth_lambda_invoke_arn" {
    value       = aws_lambda_function.auth_lambda.invoke_arn
    sensitive   = false
}

output "auth_lambda_function_name" {
    value       = aws_lambda_function.auth_lambda.function_name
    sensitive   = false
}
