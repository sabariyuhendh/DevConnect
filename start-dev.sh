#!/bin/bash

# DevConnect Development Startup Script

echo "================================"
echo "DevConnect Development Startup"
echo "================================"
echo ""

# Check if backend is already running
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ Backend already running on port 3001"
else
    echo "Starting backend..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo "✓ Backend started (PID: $BACKEND_PID)"
fi

echo ""
sleep 2

# Check if frontend is already running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "✓ Frontend already running on port 8081"
else
    echo "Starting frontend..."
    cd frontend
    npm run dev -- --host &
    FRONTEND_PID=$!
    cd ..
    echo "✓ Frontend started (PID: $FRONTEND_PID)"
fi

echo ""
echo "================================"
echo "DevConnect is starting up..."
echo "================================"
echo ""
echo "Backend:"
echo "  Localhost: http://localhost:3001"
echo "  Network:   http://10.144.12.192:3001"
echo ""
echo "Frontend:"
echo "  Localhost: http://localhost:8081"
echo "  Network:   http://10.144.12.192:8081"
echo ""
echo "API Configuration:"
echo "  Current: $(grep VITE_API_URL frontend/.env | cut -d'=' -f2)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
wait
