---
description: How to deploy the LaTeX Compilation Server using Docker
---
# Deploying the LaTeX Compilation Server

This guide explains how to deploy the server using Docker and Docker Compose.

## Prerequisites
- Docker installed on your server
- Git (to clone the repo) or a way to transfer files

## Steps

### 1. Build and Run using Docker Compose (Recommended)
This is the easiest way to run the server as it handles port mapping and restart policies automatically.

```bash
# Build and start the container in detached mode
docker-compose up -d --build
```

The server will be running on port **7474** (mapped to container port 8000).
Check logs with: `docker-compose logs -f`

### 2. Manual Docker Build (Alternative)
If you prefer not to use docker-compose:

```bash
# Build the image
docker build -t latex-server .

# Run the container
# -d: detached mode
# -p 7474:8000: map host port 7474 to container port 8000
# --restart unless-stopped: auto-restart on crash/reboot
docker run -d \
  -p 7474:8000 \
  --name latex-server \
  --restart unless-stopped \
  latex-server
```

### 3. Verification
Verify the server is running:

```bash
# Check container status
docker ps

# Test health endpoint
curl http://localhost:7474/health
# Output should be: {"status":"healthy","pdflatex_available":true}
```

### 4. Updating the Server
When you make changes to the code:

```bash
# Pull new changes (if using git)
git pull

# Rebuild and restart
docker-compose up -d --build
```
