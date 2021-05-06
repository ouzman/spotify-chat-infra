output "spotify_lambda_arn" {
    value       = aws_lambda_function.spotify_lambda.arn
    sensitive   = false
}

output "spotify_lambda_function_name" {
    value       = aws_lambda_function.spotify_lambda.function_name
    sensitive   = false
}