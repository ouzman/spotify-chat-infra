resource "aws_apigatewayv2_api" "chat_api" {
  name                          = "spotify-chat-chat-api"
  protocol_type                 = "WEBSOCKET"
  route_selection_expression    = "$request.body.service"

  tags = {
    project = "spotify-chat"
  }
}
