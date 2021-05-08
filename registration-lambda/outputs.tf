output "registration_lambda_arn" {
    value       = aws_lambda_function.registration_lambda.arn
    sensitive   = false
}

output "registration_lambda_function_name" {
    value       = aws_lambda_function.registration_lambda.function_name
    sensitive   = false
}
