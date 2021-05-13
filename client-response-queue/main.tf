resource "aws_sqs_queue" "client_response_queue_dlq" {
  name                      = "${var.queue_name}-dlq"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_sqs_queue" "client_response_queue" {
  name                      = var.queue_name
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.client_response_queue_dlq.arn
    maxReceiveCount     = 10
  })

  tags = {
    project = "spotify-chat"
  }
}