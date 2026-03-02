# FRMHG Platform - Deployment Scripts

This directory contains scripts for deploying and managing the FRMHG platform.

## Available Scripts

### Production Deployment
- `deploy.sh` - Bash script for Unix/Linux/Mac deployment
- `deploy.ps1` - PowerShell script for Windows deployment

### Development Setup
- `dev-start.sh` - Bash script to start development environment
- `dev-start.ps1` - PowerShell script to start development environment

## Usage

### Full Production Deployment
```bash
# Linux/Mac
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# Windows
.\scripts\deploy.ps1
```

### Development Environment
```bash
# Linux/Mac
chmod +x scripts/dev-start.sh
./scripts/dev-start.sh

# Windows
.\scripts\dev-start.ps1
```

## What the Deployment Scripts Do

1. **Build Phase**: Build Docker images for all services
2. **Deploy Phase**: Start all containers with proper networking
3. **Database Setup**: Run migrations and seed initial data
4. **Data Generation**: Populate with realistic Moroccan hockey data
5. **Service Verification**: Ensure all services are running correctly

## Services Started

- **PostgreSQL**: Database (port 5432)
- **Redis**: Caching and queues (port 6379)
- **MinIO**: Object storage (ports 9000, 9001)
- **Traefik**: Reverse proxy (ports 80, 443, 8080)
- **API**: NestJS backend (port 3001)
- **Web**: Next.js frontend (port 3000)

## Default Credentials

- **Admin Panel**: admin@frmhg.ma / Admin123!
- **Club Access**: club@frmhg.ma / Club123!
- **MinIO Console**: minioadmin / minioadmin