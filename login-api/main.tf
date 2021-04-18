resource "aws_apigatewayv2_api" "login_api" {
  name          = "spotify-chat-login-api"
  protocol_type = "HTTP"
  body          = templatefile("${path.module}/api/openapi.yaml", { integrationInvokeArn: var.auth_lambda_invoke_arn })

  tags = {
    project = "spotify-chat"
  }
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