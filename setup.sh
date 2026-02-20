#!/bin/bash
# Quick setup script for local development

echo "Thynk Tracking - Local Development Setup"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi
echo "✓ Python 3 found"

# Check if pip is installed
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi
echo "✓ pip found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    . venv/Scripts/activate
else
    echo "❌ Failed to find activation script"
    exit 1
fi

# Verify activation by checking for pip in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
echo "✓ Virtual environment activated"

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip install -q -r requirements.txt
if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  Please edit .env and add your:"
    echo "   - GOOGLE_SHEET_ID"
    echo "   - Service account JSON (or place service_account.json in this directory)"
fi

# Check for service account
if [ ! -f "service_account.json" ] && [ -z "$GOOGLE_CREDENTIALS_JSON" ]; then
    echo ""
    echo "⚠️  No service_account.json found and GOOGLE_CREDENTIALS_JSON not set"
    echo "   Please either:"
    echo "   1. Place service_account.json in this directory, or"
    echo "   2. Set GOOGLE_CREDENTIALS_JSON environment variable"
fi

echo ""
echo "=========================================="
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your Google Sheets credentials"
echo "2. Set GOOGLE_SHEET_ID in .env"
echo "3. Run: python app.py"
echo "4. Open: http://localhost:5000/api/health"
echo ""
echo "For frontend development:"
echo "1. Open index.html in a browser or"
echo "2. Run: python -m http.server 8000"
echo "=========================================="
