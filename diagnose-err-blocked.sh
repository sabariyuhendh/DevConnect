#!/bin/bash

echo "========================================"
echo "ERR_BLOCKED_BY_CLIENT Diagnostic Tool"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check backend
echo "1. Checking Backend..."
if curl -s http://10.144.12.192:3001/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Backend is running and accessible"
else
    echo -e "   ${RED}✗${NC} Backend is NOT accessible"
    echo "   Run: cd backend && npm run dev"
fi

# Check frontend .env
echo ""
echo "2. Checking Frontend Configuration..."
FRONTEND_API=$(cat frontend/.env 2>/dev/null | grep 'VITE_API_URL' | cut -d'=' -f2)
if [ "$FRONTEND_API" = "http://10.144.12.192:3001" ]; then
    echo -e "   ${GREEN}✓${NC} Frontend .env is correct: $FRONTEND_API"
elif [ "$FRONTEND_API" = "http://localhost:3001" ]; then
    echo -e "   ${YELLOW}⚠${NC} Frontend .env uses localhost: $FRONTEND_API"
    echo "   This will cause issues when accessing from network"
    echo "   Fix: echo 'VITE_API_URL=http://10.144.12.192:3001' > frontend/.env"
else
    echo -e "   ${RED}✗${NC} Frontend .env is missing or incorrect: $FRONTEND_API"
    echo "   Fix: echo 'VITE_API_URL=http://10.144.12.192:3001' > frontend/.env"
fi

# Check if frontend is running
echo ""
echo "3. Checking Frontend Server..."
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Frontend is running on port 8081"
    echo "   Access at: http://10.144.12.192:8081"
else
    echo -e "   ${RED}✗${NC} Frontend is NOT running"
    echo "   Run: cd frontend && npm run dev -- --host"
fi

# Check CORS
echo ""
echo "4. Checking CORS Configuration..."
CORS=$(grep 'CORS_ORIGIN=' backend/.env 2>/dev/null | grep -v '#' | cut -d'=' -f2)
if [ "$CORS" = "*" ]; then
    echo -e "   ${GREEN}✓${NC} CORS allows all origins: $CORS"
else
    echo -e "   ${YELLOW}⚠${NC} CORS is restrictive: $CORS"
    echo "   For development, set: CORS_ORIGIN=*"
fi

# Test API endpoint
echo ""
echo "5. Testing API Endpoint..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://10.144.12.192:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "   ${GREEN}✓${NC} API endpoint is responding (HTTP $HTTP_CODE)"
else
    echo -e "   ${RED}✗${NC} API endpoint issue (HTTP $HTTP_CODE)"
fi

echo ""
echo "========================================"
echo "Common Causes of ERR_BLOCKED_BY_CLIENT:"
echo "========================================"
echo ""
echo "1. ${YELLOW}Browser Extensions${NC}"
echo "   - Ad blockers (uBlock Origin, AdBlock)"
echo "   - Privacy extensions (Privacy Badger, Ghostery)"
echo "   - Security extensions"
echo "   ${GREEN}Fix:${NC} Disable extensions or use Incognito mode"
echo ""
echo "2. ${YELLOW}Wrong URL${NC}"
echo "   - Accessing via localhost instead of network IP"
echo "   ${GREEN}Fix:${NC} Use http://10.144.12.192:8081 (NOT localhost)"
echo ""
echo "3. ${YELLOW}Frontend Not Restarted${NC}"
echo "   - .env changes require restart"
echo "   ${GREEN}Fix:${NC} Stop frontend (Ctrl+C) and restart"
echo ""
echo "4. ${YELLOW}Browser Cache${NC}"
echo "   - Old cached files"
echo "   ${GREEN}Fix:${NC} Hard reload (Ctrl+Shift+R or Cmd+Shift+R)"
echo ""
echo "========================================"
echo "Quick Fixes:"
echo "========================================"
echo ""
echo "1. Restart everything:"
echo "   ./restart-with-network.sh"
echo ""
echo "2. Access via network IP:"
echo "   http://10.144.12.192:8081"
echo ""
echo "3. Disable browser extensions:"
echo "   - Click extension icon"
echo "   - Disable temporarily"
echo "   - Refresh page"
echo ""
echo "4. Try Incognito/Private mode:"
echo "   - Ctrl+Shift+N (Chrome)"
echo "   - Ctrl+Shift+P (Firefox)"
echo ""
