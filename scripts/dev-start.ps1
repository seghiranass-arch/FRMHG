Write-Host '🚀 Starting FRMHG development environment...' -ForegroundColor Green

# Start only the supporting services (database, redis, minio)
Write-Host '🐳 Starting supporting services...' -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d postgres redis minio

# Wait for services to be ready
Write-Host '⏱️  Waiting for services to be ready...' -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run database setup if needed
Write-Host '📋 Setting up database...' -ForegroundColor Yellow
Set-Location apps/api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
Set-Location ../..

Write-Host ''
Write-Host '✅ Development environment ready!' -ForegroundColor Green
Write-Host '🔧 You can now start the applications manually:' -ForegroundColor Cyan
Write-Host '   API: cd apps/api && npm run dev'
Write-Host '   Web: cd apps/web && npm run dev'
Write-Host ''
Write-Host '🔗 Services available:' -ForegroundColor Cyan
Write-Host '   Database: localhost:5432'
Write-Host '   Redis: localhost:6379'
Write-Host '   MinIO Console: http://localhost:9001'
