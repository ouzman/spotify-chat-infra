output "spotify_lambda_arn" {
    value       = aws_lambda_function.spotify_lambda.arn
    sensitive   = false
}