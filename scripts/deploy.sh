#!/bin/bash

echo "🚀 Building and deploying FRMHG platform..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build services
echo "🏗️  Building services..."
docker-compose build

# Start services
echo "🐳 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏱️  Waiting for database to be ready..."
sleep 15

# Run database migrations
echo "📋 Running database migrations..."
docker-compose exec api npm run prisma:migrate

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose exec api npm run prisma:generate

# Run data seeding
echo "🌱 Seeding database with realistic data..."
docker-compose exec api npm run prisma:seed

# Run advanced data generation
echo "📊 Generating advanced realistic data..."
docker-compose exec api npx ts-node prisma/advanced-seed.ts

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API: http://localhost:3001"
echo "   Database: localhost:5432"
echo "   Redis: localhost:6379"
echo "   MinIO Console: http://localhost:9001"
echo "   Traefik Dashboard: http://localhost:8080"
echo ""
echo "🔐 Default credentials:"
echo "   Admin: admin@frmhg.ma / Admin123!"
echo "   Club: club@frmhg.ma / Club123!"
echo "   MinIO: minioadmin / minioadmin"