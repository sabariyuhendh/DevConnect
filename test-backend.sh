#!/bin/bash

echo "=== Testing DevConnect Backend ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:3001"

echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
HEALTH=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$HEALTH" | tail -n1)
RESPONSE=$(echo "$HEALTH" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $RESPONSE"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Username Check (Available)
echo "Test 2: Username Check (New Username)"
echo "-------------------------------------"
USERNAME="testuser$(date +%s)"
CHECK=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/check-username?username=$USERNAME")
HTTP_CODE=$(echo "$CHECK" | tail -n1)
RESPONSE=$(echo "$CHECK" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$RESPONSE" | grep -q '"available":true'; then
        echo -e "${GREEN}✓ Username check passed (available)${NC}"
        echo "Response: $RESPONSE"
    else
        echo -e "${YELLOW}⚠ Username check returned false (might be taken)${NC}"
        echo "Response: $RESPONSE"
    fi
else
    echo -e "${RED}✗ Username check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Username Check (Existing)
echo "Test 3: Username Check (Existing Username)"
echo "------------------------------------------"
CHECK=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/check-username?username=admin")
HTTP_CODE=$(echo "$CHECK" | tail -n1)
RESPONSE=$(echo "$CHECK" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Username check endpoint working${NC}"
    echo "Response: $RESPONSE"
else
    echo -e "${RED}✗ Username check failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Signup (New User)
echo "Test 4: Signup (New User)"
echo "------------------------"
RANDOM_USER="testuser$(date +%s)"
SIGNUP=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$RANDOM_USER\",\"email\":\"$RANDOM_USER@test.com\",\"password\":\"password123\"}")
HTTP_CODE=$(echo "$SIGNUP" | tail -n1)
RESPONSE=$(echo "$SIGNUP" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Signup successful${NC}"
    echo "Response: $RESPONSE" | head -c 100
    echo "..."
else
    echo -e "${RED}✗ Signup failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 5: CORS Check
echo "Test 5: CORS Headers"
echo "-------------------"
CORS=$(curl -s -I -X OPTIONS "$BACKEND_URL/api/auth/check-username" \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET")

if echo "$CORS" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ CORS headers present${NC}"
    echo "$CORS" | grep "Access-Control"
else
    echo -e "${YELLOW}⚠ CORS headers not found (might still work)${NC}"
fi
echo ""

echo "=== Test Summary ==="
echo "If all tests passed, your backend is working correctly!"
echo "If any tests failed, check the backend logs and configuration."
echo ""
echo "Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Open browser to http://localhost:5173"
echo "3. Check browser console for API configuration"
echo "4. Try signing up with a new username"
