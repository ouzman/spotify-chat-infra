data "archive_file" "auth_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/auth-lambda.zip"
}

resource "aws_iam_role" "auth_lambda_role" {
  name = "spotify_chat_auth_lambda_role"

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
}

resource "aws_iam_role_policy" "auth_lambda_policy" {
  name        = "spotify_chat_auth_lambda_policy"
  role        =  aws_iam_role.auth_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
          "logs:CreateLogStream",
          "logs:CreateLogGroup",
          "logs:PutLogEvents"
      ],
      "Resource": [
          "arn:aws:logs:*:*:*"
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

resource "aws_lambda_function" "auth_lambda" {
  function_name = "auth-lambda"
  role          = aws_iam_role.auth_lambda_role.arn
  handler       = "auth-lambda.handler"
  
  filename      = "${path.module}/js/dist/auth-lambda.zip"
  source_code_hash = data.archive_file.auth_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"
}