#!/bin/bash
# Setup script for the transcription service

set -e

echo "Setting up Transcription Service..."

# Check Python version
python3 --version || { echo "Python 3 is required"; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Copy .env.example to .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit .env to configure your settings"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the service:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "The service will be available at http://localhost:8000"
