#!/bin/bash

# Quick test script for network IP 10.144.12.192

IP="10.144.12.192"
BACKEND_PORT="3001"
FRONTEND_PORT="8080"

echo "==================================="
echo "Network Test for $IP"
echo "==================================="
echo ""

# Test 1: Backend Health
echo "Test 1: Backend Health Check"
echo "----------------------------"
echo "Testing: http://$IP:$BACKEND_PORT/health"
HEALTH=$(curl -s -w "\n%{http_code}" "http://$IP:$BACKEND_PORT/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Backend is accessible from network"
    echo "Response: $(echo "$HEALTH" | head -n-1)"
else
    echo "✗ Backend NOT accessible (HTTP $HTTP_CODE)"
    echo "Response: $(echo "$HEALTH" | head -n-1)"
    echo ""
    echo "Possible issues:"
    echo "1. Backend not running"
    echo "2. Firewall blocking port $BACKEND_PORT"
    echo "3. Backend only listening on localhost"
    echo ""
    echo "Try: curl http://localhost:$BACKEND_PORT/health"
    echo "If that works, backend is only listening on localhost"
fi
echo ""

# Test 2: Username Check
echo "Test 2: Username Check API"
echo "--------------------------"
USERNAME="testuser$(date +%s)"
echo "Testing: http://$IP:$BACKEND_PORT/api/auth/check-username?username=$USERNAME"
CHECK=$(curl -s -w "\n%{http_code}" "http://$IP:$BACKEND_PORT/api/auth/check-username?username=$USERNAME" 2>&1)
HTTP_CODE=$(echo "$CHECK" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Username check API working"
    echo "Response: $(echo "$CHECK" | head -n-1)"
else
    echo "✗ Username check API failed (HTTP $HTTP_CODE)"
    echo "Response: $(echo "$CHECK" | head -n-1)"
fi
echo ""

# Test 3: Frontend Accessibility
echo "Test 3: Frontend Accessibility"
echo "------------------------------"
echo "Testing: http://$IP:$FRONTEND_PORT/"
FRONTEND=$(curl -s -w "\n%{http_code}" "http://$IP:$FRONTEND_PORT/" 2>&1)
HTTP_CODE=$(echo "$FRONTEND" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Frontend is accessible from network"
else
    echo "✗ Frontend NOT accessible (HTTP $HTTP_CODE)"
    echo ""
    echo "Make sure frontend is started with: npm run dev -- --host"
fi
echo ""

# Test 4: Check .env Configuration
echo "Test 4: Frontend Configuration"
echo "------------------------------"
if [ -f "frontend/.env" ]; then
    API_URL=$(grep VITE_API_URL frontend/.env | cut -d= -f2)
    echo "Current VITE_API_URL: $API_URL"
    
    if [[ "$API_URL" == *"$IP"* ]]; then
        echo "✓ Frontend configured with correct IP"
    else
        echo "✗ Frontend NOT configured with network IP"
        echo "Expected: http://$IP:$BACKEND_PORT"
        echo "Found: $API_URL"
        echo ""
        echo "Fix: Update frontend/.env with:"
        echo "VITE_API_URL=http://$IP:$BACKEND_PORT"
    fi
else
    echo "✗ frontend/.env not found"
fi
echo ""

# Summary
echo "==================================="
echo "Summary"
echo "==================================="
echo ""
echo "Backend URL: http://$IP:$BACKEND_PORT"
echo "Frontend URL: http://$IP:$FRONTEND_PORT"
echo ""
echo "Next steps:"
echo "1. If backend test failed: Check firewall and backend status"
echo "2. If frontend test failed: Start with 'npm run dev -- --host'"
echo "3. If .env is wrong: Update frontend/.env and restart frontend"
echo "4. Open browser to: http://$IP:$FRONTEND_PORT"
echo "5. Check browser console for API configuration"
echo "6. Disable ad blocker if you see ERR_BLOCKED_BY_CLIENT"
echo ""
