#!/bin/bash

echo "========================================"
echo "Restarting DevConnect with Network Access"
echo "========================================"
echo ""

# Stop all services
echo "Stopping all services..."
pkill -f "ts-node-dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Verify configuration
echo "Verifying configuration..."
echo "  Backend PORT: $(grep 'PORT=' backend/.env | grep -v '#' | cut -d'=' -f2)"
echo "  Backend CORS: $(grep 'CORS_ORIGIN=' backend/.env | grep -v '#' | cut -d'=' -f2)"
echo "  Frontend API: $(cat frontend/.env | grep 'VITE_API_URL' | cut -d'=' -f2)"
echo ""

# Check if configuration is correct
FRONTEND_API=$(cat frontend/.env | grep 'VITE_API_URL' | cut -d'=' -f2)
if [ "$FRONTEND_API" != "http://10.144.12.192:3001" ]; then
    echo "⚠️  WARNING: Frontend API URL is not set to network IP!"
    echo "   Current: $FRONTEND_API"
    echo "   Expected: http://10.144.12.192:3001"
    echo ""
    read -p "Do you want to fix this? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "VITE_API_URL=http://10.144.12.192:3001" > frontend/.env
        echo "✓ Fixed frontend .env"
    fi
fi

echo "Starting backend..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "  Backend PID: $BACKEND_PID"

sleep 3

echo "Starting frontend..."
cd frontend
npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "  Frontend PID: $FRONTEND_PID"

sleep 3

echo ""
echo "========================================"
echo "Services Started!"
echo "========================================"
echo ""
echo "Access URLs:"
echo "  Frontend: http://10.144.12.192:8081"
echo "  Backend:  http://10.144.12.192:3001"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Access via http://10.144.12.192:8081 (NOT localhost)"
echo "2. Disable browser extensions if you see ERR_BLOCKED_BY_CLIENT"
echo "3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo ""
echo "Testing backend..."
sleep 2
curl -s http://10.144.12.192:3001/health && echo " ✓ Backend is responding" || echo " ✗ Backend not responding"
echo ""
