#!/bin/bash

# HVAC Flow - One-Command Deploy Script
# This script provisions and sets up the complete Next.js HVAC SaaS application

set -e  # Exit on error

echo "=================================="
echo "HVAC Flow - Deploy Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or 20 (LTS)"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js version: $NODE_VERSION"

# Check if npm is installed
print_info "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm 8+"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm version: $NPM_VERSION"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed successfully"

# Check if .env exists, if not create from .env.example
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Created .env file. Please update it with your actual credentials:"
        print_warning "  - NEXT_PUBLIC_SUPABASE_URL"
        print_warning "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        print_warning "  - XAI_API_KEY"
        print_warning "  - TWILIO_ACCOUNT_SID"
        print_warning "  - TWILIO_AUTH_TOKEN"
        print_warning "  - TWILIO_PHONE_NUMBER"
        echo ""
    else
        print_error ".env.example not found!"
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# Validate environment variables
print_info "Checking environment variables..."
ENV_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "XAI_API_KEY"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
)

missing_vars=()
for var in "${ENV_VARS[@]}"; do
    if ! grep -q "^${var}=" .env 2>/dev/null || grep -q "^${var}=your-" .env 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_warning "Please update .env with your actual credentials before running the app"
    echo ""
fi

# Run linting
print_info "Running ESLint..."
npm run lint
print_success "Linting completed successfully"

# Build the application
print_info "Building the application..."
npm run build
print_success "Build completed successfully"

# Create public directory if it doesn't exist
if [ ! -d "public" ]; then
    print_info "Creating public directory..."
    mkdir -p public
    print_success "Public directory created"
fi

# Print summary
echo ""
echo "=================================="
print_success "HVAC Flow Setup Complete!"
echo "=================================="
echo ""
print_info "Next steps:"
echo "  1. Update .env with your actual credentials"
echo "  2. Set up your Supabase database schema (see README.md)"
echo "  3. Run 'npm run dev' to start the development server"
echo "  4. Open http://localhost:3000 in your browser"
echo ""
print_info "For production deployment:"
echo "  1. Configure environment variables in Vercel"
echo "  2. Run 'vercel' to deploy"
echo "  3. Update Supabase redirect URLs with your production domain"
echo ""
print_info "Documentation:"
echo "  - README.md for detailed setup instructions"
echo "  - API documentation in README.md"
echo "  - Twilio setup guide in README.md"
echo ""
print_success "Happy coding! 🚀"
echo ""
