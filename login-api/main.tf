resource "aws_apigatewayv2_api" "login-api" {
  name          = "spotify-chat-login-api"
  protocol_type = "HTTP"
  body          = file("./api/openapi.yaml")

  tags = {
    project = "spotify-chat"
  }
}