Write-Host "🚀 Building and deploying FRMHG platform..." -ForegroundColor Green

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Build services
Write-Host "🏗️  Building services..." -ForegroundColor Yellow
docker-compose build

# Start services
Write-Host "🐳 Starting services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for database to be ready
Write-Host "⏱️  Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Run database migrations
Write-Host "📋 Running database migrations..." -ForegroundColor Yellow
docker-compose exec api npm run prisma:migrate

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
docker-compose exec api npm run prisma:generate

# Run data seeding
Write-Host "🌱 Seeding database with realistic data..." -ForegroundColor Yellow
docker-compose exec api npm run prisma:seed

# Run advanced data generation
Write-Host "📊 Generating advanced realistic data..." -ForegroundColor Yellow
docker-compose exec api npx ts-node prisma/advanced-seed.ts

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   API: http://localhost:3001"
Write-Host "   Database: localhost:5432"
Write-Host "   Redis: localhost:6379"
Write-Host "   MinIO Console: http://localhost:9001"
Write-Host "   Traefik Dashboard: http://localhost:8080"
Write-Host ""
Write-Host "🔐 Default credentials:" -ForegroundColor Cyan
Write-Host "   Admin: admin@frmhg.ma / Admin123!"
Write-Host "   Club: club@frmhg.ma / Club123!"
Write-Host "   MinIO: minioadmin / minioadmin"