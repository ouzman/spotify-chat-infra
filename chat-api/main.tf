resource "aws_apigatewayv2_api" "chat_api" {
  name                          = "spotify-chat-chat-api"
  protocol_type                 = "WEBSOCKET"
  route_selection_expression    = "$request.body.action"

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_lambda_permission" "chat_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.chat_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.chat_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_deployment" "default_deployment" {
  api_id      = aws_apigatewayv2_api.chat_api.id
  description = "Default deployment"

  triggers = {
    redeployment = sha1(
        join(",", 
            list(jsonencode(aws_apigatewayv2_api.chat_api), 
            var.chat_lambda_arn,
    )))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_apigatewayv2_api.chat_api,
  ]
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id        = aws_apigatewayv2_api.chat_api.id
  name          = "$default"
  deployment_id = aws_apigatewayv2_deployment.default_deployment.id
  auto_deploy   = false
}

resource "aws_apigatewayv2_authorizer" "chat_api_authorizer" {
  api_id           = aws_apigatewayv2_api.chat_api.id
  authorizer_type  = "REQUEST"
  authorizer_uri   = var.api_key_authorizer_lambda_arn
  identity_sources = ["route.request.header.X-SC-ApiKey"]
  name             = "api-key-authorizer"
}
