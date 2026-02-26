#!/bin/bash

# Test Authentication Endpoints
# Tests both localhost and network IP endpoints

echo "================================"
echo "Testing DevConnect Auth Endpoints"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test URLs
LOCALHOST_URL="http://localhost:3001"
NETWORK_URL="http://10.144.12.192:3001"

# Function to test endpoint
test_endpoint() {
    local url=$1
    local endpoint=$2
    local method=$3
    local data=$4
    
    echo -n "Testing $url$endpoint ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        echo "   Response: $body"
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 500 ]; then
        echo -e "${YELLOW}✓ Expected Error${NC} (HTTP $http_code)"
        echo "   Response: $body"
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "   Response: $body"
    fi
    echo ""
}

echo "=== Testing LOCALHOST ($LOCALHOST_URL) ==="
echo ""

test_endpoint "$LOCALHOST_URL" "/health" "GET" ""
test_endpoint "$LOCALHOST_URL" "/api/auth/check-username?username=testuser123" "GET" ""
test_endpoint "$LOCALHOST_URL" "/api/auth/login" "POST" '{"email":"test@example.com","password":"test"}'

echo ""
echo "=== Testing NETWORK IP ($NETWORK_URL) ==="
echo ""

test_endpoint "$NETWORK_URL" "/health" "GET" ""
test_endpoint "$NETWORK_URL" "/api/auth/check-username?username=testuser456" "GET" ""
test_endpoint "$NETWORK_URL" "/api/auth/login" "POST" '{"email":"test@example.com","password":"test"}'

echo ""
echo "================================"
echo "Test Complete"
echo "================================"
echo ""
echo "Frontend Configuration:"
echo "  Current API URL: $(grep VITE_API_URL frontend/.env | cut -d'=' -f2)"
echo ""
echo "Backend Configuration:"
echo "  Port: $(grep PORT backend/.env | grep -v '#' | cut -d'=' -f2)"
echo "  CORS: $(grep CORS_ORIGIN backend/.env | grep -v '#' | cut -d'=' -f2)"
echo ""
