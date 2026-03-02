#!/bin/bash

echo "🚀 Starting FRMHG development environment..."

# Start only the supporting services (database, redis, minio)
echo "🐳 Starting supporting services..."
docker-compose -f docker-compose.dev.yml up -d postgres redis minio

# Wait for services to be ready
echo "⏱️  Waiting for services to be ready..."
sleep 10

# Run database setup if needed
echo "📋 Setting up database..."
cd apps/api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ../..

echo ""
echo "✅ Development environment ready!"
echo "🔧 You can now start the applications manually:"
echo "   API: cd apps/api && npm run dev"
echo "   Web: cd apps/web && npm run dev"
echo ""
echo "🔗 Services available:"
echo "   Database: localhost:5432"
echo "   Redis: localhost:6379"
echo "   MinIO Console: http://localhost:9001"
