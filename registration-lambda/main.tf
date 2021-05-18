data "archive_file" "registration_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/registration-lambda.zip"
}

resource "aws_iam_role" "registration_lambda_role" {
  name = "spotify_chat_registration_lambda_role"

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

resource "aws_iam_role_policy" "registration_lambda_policy" {
  name        = "spotify_chat_registration_lambda_policy"
  role        =  aws_iam_role.registration_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
          "lambda:InvokeFunction"
      ],
      "Resource": [
          "${var.spotify_lambda_arn}"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query"
      ],
      "Resource": [
          "${var.users_db_table_arn}",
          "${var.users_db_table_arn}/index/*",
          "${var.api_keys_db_table_arn}",
          "${var.api_keys_db_table_arn}/index/*"
      ],
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

resource "aws_lambda_function" "registration_lambda" {
  function_name = "spotify-chat-registration-lambda"
  role          = aws_iam_role.registration_lambda_role.arn
  handler       = "registration-lambda.handler"
  timeout       = 60
  
  filename      = "${path.module}/js/dist/registration-lambda.zip"
  source_code_hash = data.archive_file.registration_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"

  environment {
    variables = {
      USERS_DB_TABLE_NAME = var.users_db_table_name,
      API_KEYS_DB_TABLE_NAME = var.api_keys_db_table_name,
      SPOTIFY_LAMBDA_FUNCTION_NAME = var.spotify_lambda_function_name,
      API_KEYS_DB_USER_URI_INDEX = var.api_keys_db_user_uri_index,
    }
  }
  tags = {
    project = "spotify-chat"
  }
}