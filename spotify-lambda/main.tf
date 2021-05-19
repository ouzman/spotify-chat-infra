data "archive_file" "spotify_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/spotify-lambda.zip"
}

resource "aws_iam_role" "spotify_lambda_role" {
  name = "spotify_chat_spotify_lambda_role"

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

resource "aws_iam_role_policy" "spotify_lambda_policy" {
  name        = "spotify_chat_spotify_lambda_policy"
  role        =  aws_iam_role.spotify_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
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

resource "aws_lambda_function" "spotify_lambda" {
  function_name = "spotify-chat-spotify-lambda"
  role          = aws_iam_role.spotify_lambda_role.arn
  handler       = "spotify-lambda.handler"
  timeout       = 60

  filename      = "${path.module}/js/dist/spotify-lambda.zip"
  source_code_hash = data.archive_file.spotify_lambda_archive.output_base64sha256

  runtime = "nodejs14.x"

  environment {
    variables = {
      SPOTIFY_CLIENT_ID = var.spotify_client_id,
      SPOTIFY_CLIENT_SECRET = var.spotify_client_secret,
    }
  }
  tags = {
    project = "spotify-chat"
  }
}