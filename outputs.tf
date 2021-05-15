output "ecs_instance_private_key" {
  value       = var.ecs_instance_private_key
  sensitive   = true
}

output "ecs_instance_public_ip" {
  value       = module.update_currently_playing_ecs.ecs_instance_public_ip
  sensitive   = false
}