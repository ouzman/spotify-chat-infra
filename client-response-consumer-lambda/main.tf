data "archive_file" "client_response_consumer_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/client-response-consumer-lambda.zip"
}

resource "aws_iam_role" "client_response_consumer_lambda_role" {
  name = "spotify_chat_client_response_consumer_lambda_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
  tags = {
    project = "spotify-chat"
  }
}

resource "aws_iam_role_policy" "client_response_consumer_lambda_policy" {
  name        = "spotify_chat_client_response_consumer_lambda_policy"
  role        =  aws_iam_role.client_response_consumer_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
      ],
      "Resource": "${var.client_response_queue_arn}",
      "Effect": "Allow"
    },    
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_lambda_function" "client_response_consumer_lambda" {
  function_name = "spotify-chat-client-response-consumer-lambda"
  role          = aws_iam_role.client_response_consumer_lambda_role.arn
  handler       = "client-response-consumer-lambda.handler"
  
  filename      = "${path.module}/js/dist/client-response-consumer-lambda.zip"
  source_code_hash = data.archive_file.client_response_consumer_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_lambda_event_source_mapping" "client_response_event_source_mapping" {
  event_source_arn = var.client_response_queue_arn
  function_name    = aws_lambda_function.client_response_consumer_lambda.arn
}