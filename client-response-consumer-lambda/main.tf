data "archive_file" "client_response_consumer_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/client-response-consumer-lambda.zip"
}

data "aws_iam_policy_document" "client_response_consumer_lambda_role_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type            = "Service"
      identifiers     = ["lambda.amazonaws.com"]
    }
    effect = "Allow"
  }
}

resource "aws_iam_role" "client_response_consumer_lambda_role" {
  name = "spotify_chat_client_response_consumer_lambda_role"

  assume_role_policy = data.aws_iam_policy_document.client_response_consumer_lambda_role_policy.json
  
  tags = {
    project = "spotify-chat"
  }
}

data "aws_iam_policy_document" "client_response_consumer_lambda_policy" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:*:*:*",
    ]
    effect = "Allow"
  }

  statement {
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [
      var.client_response_queue_arn,
    ]
    effect = "Allow"
  }
}

resource "aws_iam_role_policy" "client_response_consumer_lambda_policy" {
  name    = "spotify_chat_client_response_consumer_lambda_policy"
  role    = aws_iam_role.client_response_consumer_lambda_role.id
  policy  = data.aws_iam_policy_document.client_response_consumer_lambda_policy.json
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