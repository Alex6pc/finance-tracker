#!/bin/bash

echo "Checking Docker environment..."

# Start Docker service
sudo service docker start

# Wait for Docker to initialize
echo "Waiting for Docker to initialize..."
sleep 10

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running properly. Checking permissions..."
  
  # Check if docker group exists
  if ! getent group docker > /dev/null; then
    echo "Creating docker group..."
    sudo groupadd docker
  fi
  
  # Add current user to docker group
  echo "Adding user to docker group..."
  sudo usermod -aG docker $USER
  
  # Check if the docker.sock exists
  if [ ! -S /var/run/docker.sock ]; then
    echo "Docker socket not found. Restarting Docker..."
    sudo service docker restart
    sleep 10
  fi
  
  # Fix permissions on docker socket
  echo "Setting permissions on docker socket..."
  sudo chmod 666 /var/run/docker.sock
  
  # Try again
  if ! docker info > /dev/null 2>&1; then
    echo "Still having issues with Docker. Please try:"
    echo "1. Run: 'sudo service docker restart'"
    echo "2. Wait a few seconds"
    echo "3. Run: 'sudo chmod 666 /var/run/docker.sock'"
    exit 1
  fi
fi

echo "Docker is running correctly!"
exit 0 