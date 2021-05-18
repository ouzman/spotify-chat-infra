output "match_lambda_invoke_arn" {
    value     = aws_lambda_function.match_lambda.invoke_arn
    sensitive = false
}

output "match_lambda_function_name" {
    value     = aws_lambda_function.match_lambda.function_name
    sensitive = false
}

output "match_lambda_role_name" {
    value     = aws_iam_role.match_lambda_role.name
    sensitive = false
}