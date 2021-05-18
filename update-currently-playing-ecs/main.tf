data "aws_region" "current" {}

data "aws_iam_policy_document" "update_currently_playing_task_role_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type            = "Service"
      identifiers     = ["ecs-tasks.amazonaws.com"]
    }
    effect = "Allow"
  }
}

resource "aws_iam_role" "update_currently_playing_task_role" {
  name = "update_currently_playing_task_role"

  assume_role_policy = data.aws_iam_policy_document.update_currently_playing_task_role_policy.json

  tags = {
    project = "spotify-chat"
  }
}

data "aws_iam_policy_document" "update_currently_playing_task_policy" {
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
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:Scan",
      "dynamodb:Query",
    ]
    resources = [
      var.users_db_table_arn,
      "${var.users_db_table_arn}/index/*",    
      var.connections_db_table_arn,
      "${var.connections_db_table_arn}/index/*",    
    ]
    effect = "Allow"
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]
    resources = [
      var.update_currently_playing_source_bucket_arn,
      "${var.update_currently_playing_source_bucket_arn}/*",
    ]
    effect = "Allow"
  }

  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      "${var.spotify_lambda_arn}",
    ]
    effect = "Allow"
  }
}

resource "aws_iam_role_policy" "update_currently_playing_task_policy" {
  name      = "update_currently_playing_task_policy"
  role      = aws_iam_role.update_currently_playing_task_role.id
  policy    = data.aws_iam_policy_document.update_currently_playing_task_policy.json
}

resource "aws_ecs_task_definition" "update_currently_playing_task" {
  family                    = "update-currently-playing-task"
  container_definitions     = templatefile("${path.module}/json/container-definitions.json", { 
    usersDbTableName              = var.users_db_table_name,
    connectionsDbTableName        = var.connections_db_table_name,
    connectionsDbUserUriIndexName = var.connections_db_user_uri_index,
    sourceArchiveEtag             = var.update_currently_playing_source_etag,
    spotifyLambdaFunctionName     = var.spotify_lambda_function_name,
    region                        = data.aws_region.current.name,
  })
  requires_compatibilities  = [ "EC2" ]
  task_role_arn             = aws_iam_role.update_currently_playing_task_role.arn
  
  tags = {
    project = "spotify-chat"
  }
}

resource "aws_ecs_cluster" "update_currently_playing_cluster" {
  name = "update-currently-playing-cluster"

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_key_pair" "ecs_instance_key_pair" {
  key_name   = "ecs-instance-key-pair"
  public_key = var.ecs_instance_public_key
}

data "aws_ami" "ecs_optimized" {
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-2.0.*-x86_64-ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = [ "amazon" ]
}

resource "aws_security_group" "ecs_instance_security_group" {
  name = "ecs-instance-security-group"

  ingress {
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "all"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_instance" "ecs_instance" {
  ami                         = data.aws_ami.ecs_optimized.id
  instance_type               = "t2.micro"
  iam_instance_profile        = "ecsInstanceRole"
  key_name                    = aws_key_pair.ecs_instance_key_pair.key_name
  ebs_optimized               = "false"
  user_data                   = templatefile("${path.module}/bash/userdata.bash", { 
    clusterName = aws_ecs_cluster.update_currently_playing_cluster.name, 
    instanceTags = jsonencode({ "\"project\"" = "\"spotify-chat\"" }),
  })
  vpc_security_group_ids      = [ aws_security_group.ecs_instance_security_group.id ]
  associate_public_ip_address = true

  tags = {
    project = "spotify-chat"
  }

  depends_on = [ aws_security_group.ecs_instance_security_group ]
}

resource "aws_ecs_service" "update_currently_playing_service" {
  name                  = "update-currently-playing-service"
  cluster               = aws_ecs_cluster.update_currently_playing_cluster.id
  task_definition       = aws_ecs_task_definition.update_currently_playing_task.arn
  scheduling_strategy   = "DAEMON"
  launch_type           = "EC2"
  force_new_deployment  = true

  tags = {
    project = "spotify-chat"
  }

  depends_on = [ aws_instance.ecs_instance ]
}