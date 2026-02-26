#!/bin/bash

# Switch between local and network environment configurations

if [ "$1" = "local" ]; then
    echo "Switching to LOCAL configuration..."
    cp frontend/.env.local frontend/.env
    echo "✓ Frontend API URL: http://localhost:3001"
    echo ""
    echo "To start frontend:"
    echo "  cd frontend && npm run dev"
    
elif [ "$1" = "network" ]; then
    echo "Switching to NETWORK configuration..."
    cp frontend/.env.network frontend/.env
    echo "✓ Frontend API URL: http://10.144.12.192:3001"
    echo ""
    echo "To start frontend with network access:"
    echo "  cd frontend && npm run dev -- --host"
    
else
    echo "Usage: ./switch-env.sh [local|network]"
    echo ""
    echo "Options:"
    echo "  local   - Use localhost (http://localhost:3001)"
    echo "  network - Use network IP (http://10.144.12.192:3001)"
    echo ""
    echo "Current configuration:"
    if [ -f frontend/.env ]; then
        echo "  API URL: $(grep VITE_API_URL frontend/.env | cut -d'=' -f2)"
    else
        echo "  No .env file found"
    fi
    exit 1
fi

echo ""
echo "Backend is already configured to accept connections from all origins."
echo "Backend URL: http://localhost:3001 or http://10.144.12.192:3001"
