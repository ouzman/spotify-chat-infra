#!/bin/bash

# Update all packages

sudo yum update -y
sudo yum install -y ecs-init
sudo service docker start
sudo start ecs

echo ECS_CLUSTER=update-currently-playing-cluster >> /etc/ecs/ecs.config
echo ECS_CONTAINER_INSTANCE_TAGS={\"project\":\"spotify-chat\"} >> /etc/ecs/ecs.config