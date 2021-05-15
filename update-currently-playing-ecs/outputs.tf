output "ecs_instance_public_ip" {
  value     = aws_instance.ecs_instance.public_ip
  sensitive = false
}