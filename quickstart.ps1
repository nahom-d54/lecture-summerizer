# Quick Start Script for Windows PowerShell

Write-Host "🚀 Lecture Summarizer - Quick Start" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Docker (optional)
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "⚠️  Docker not found. Docker is optional but recommended." -ForegroundColor Yellow
    $dockerAvailable = $false
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Set up environment files
Write-Host "⚙️  Setting up environment files..." -ForegroundColor Yellow

if (-Not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env from template" -ForegroundColor Green
} else {
    Write-Host "ℹ️  backend/.env already exists" -ForegroundColor Blue
}

if (-Not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "✅ Created frontend/.env from template" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend/.env already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Ask about startup method
Write-Host "How would you like to start the application?" -ForegroundColor Cyan
Write-Host "1. 🐳 Docker Compose (Recommended - includes Redis)" -ForegroundColor White
Write-Host "2. 💻 Local Development (requires Redis running separately)" -ForegroundColor White
Write-Host "3. ❌ Skip startup (just setup)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        if ($dockerAvailable) {
            Write-Host ""
            Write-Host "🐳 Starting Docker Compose..." -ForegroundColor Yellow
            docker-compose up -d
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Application started successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
                Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
                Write-Host "📊 Redis:    localhost:6379" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "View logs: docker-compose logs -f" -ForegroundColor Yellow
                Write-Host "Stop services: docker-compose down" -ForegroundColor Yellow
            } else {
                Write-Host "❌ Failed to start Docker Compose" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Docker is not available" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host ""
        Write-Host "⚠️  Make sure Redis is running:" -ForegroundColor Yellow
        Write-Host "   docker run -d -p 6379:6379 redis:7-alpine" -ForegroundColor White
        Write-Host ""
        Write-Host "💻 Starting local development..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Starting both frontend and backend..." -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "3" {
        Write-Host ""
        Write-Host "✅ Setup completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start development later, run:" -ForegroundColor Cyan
        Write-Host "  npm run dev          - Local development" -ForegroundColor White
        Write-Host "  npm run docker:up    - Docker Compose" -ForegroundColor White
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Setup completed without starting." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md - Project overview" -ForegroundColor White
Write-Host "   - SETUP.md - Detailed setup guide" -ForegroundColor White
Write-Host "   - PROJECT_STRUCTURE.md - Project structure" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Happy coding!" -ForegroundColor Green
Write-Host ""
