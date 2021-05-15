#!/bin/bash

sudo yum update -y
sudo yum install -y ecs-init
sudo service docker start
sudo start ecs

echo ECS_CLUSTER=${clusterName} >> /etc/ecs/ecs.config
echo ECS_CONTAINER_INSTANCE_TAGS=${instanceTags} >> /etc/ecs/ecs.config