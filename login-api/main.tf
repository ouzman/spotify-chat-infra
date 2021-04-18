resource "aws_apigatewayv2_api" "login_api" {
  name          = "spotify-chat-login-api"
  protocol_type = "HTTP"
  body          = file("${path.module}/api/openapi.yaml")

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_apigatewayv2_integration" "auth_lambda_integration" {
  api_id           = aws_apigatewayv2_api.login_api.id
  integration_type = "AWS_PROXY"

  integration_method    = "ANY"
  integration_uri       = var.auth_lambda_invoke_arn
}

resource "aws_lambda_permission" "auth_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.auth_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.login_api.execution_arn}/*/*"
}
