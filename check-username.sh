#!/bin/bash

# Username Check Diagnostic Script
# Usage: ./check-username.sh [API_URL] [USERNAME]

API_URL="${1:-http://localhost:3001}"
USERNAME="${2}"

echo "=== Username Check Diagnostic ==="
echo ""
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
HEALTH=$(curl -s -w "\n%{http_code}" "$API_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Backend is reachable"
else
    echo "✗ Cannot reach backend (HTTP $HTTP_CODE)"
    echo "Make sure backend is running on $API_URL"
    exit 1
fi
echo ""

# If no username provided, ask for it
if [ -z "$USERNAME" ]; then
    echo "Enter username to check:"
    read USERNAME
fi

if [ -z "$USERNAME" ]; then
    echo "✗ Username is required"
    exit 1
fi

echo "Test 2: Username Check"
echo "---------------------"
echo "Checking username: \"$USERNAME\""
echo ""

# URL encode the username
ENCODED_USERNAME=$(echo "$USERNAME" | jq -sRr @uri)
CHECK_URL="$API_URL/api/auth/check-username?username=$ENCODED_USERNAME"

echo "Request URL: $CHECK_URL"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" "$CHECK_URL")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "Response Status: $HTTP_CODE"
echo "Response Body: $BODY"
echo ""

# Parse the response
if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q '"available":true'; then
        echo "✓ Username is AVAILABLE"
    elif echo "$BODY" | grep -q '"available":false'; then
        echo "✗ Username is TAKEN"
        echo ""
        echo "This username exists in the database."
        echo "To verify, run: cd backend && npx prisma studio"
        echo "Then search for '$USERNAME' in the User table"
    else
        echo "⚠ Unexpected response format"
    fi
else
    echo "✗ Request failed with HTTP $HTTP_CODE"
fi

echo ""
echo "Test 3: Testing Variations"
echo "-------------------------"

# Test lowercase
LOWER=$(echo "$USERNAME" | tr '[:upper:]' '[:lower:]')
RESPONSE=$(curl -s "$API_URL/api/auth/check-username?username=$(echo "$LOWER" | jq -sRr @uri)")
AVAILABLE=$(echo "$RESPONSE" | grep -o '"available":[^,}]*' | cut -d: -f2)
echo "Lowercase \"$LOWER\" -> available: $AVAILABLE"

# Test uppercase
UPPER=$(echo "$USERNAME" | tr '[:lower:]' '[:upper:]')
RESPONSE=$(curl -s "$API_URL/api/auth/check-username?username=$(echo "$UPPER" | jq -sRr @uri)")
AVAILABLE=$(echo "$RESPONSE" | grep -o '"available":[^,}]*' | cut -d: -f2)
echo "Uppercase \"$UPPER\" -> available: $AVAILABLE"

# Test trimmed
TRIMMED=$(echo "$USERNAME" | xargs)
RESPONSE=$(curl -s "$API_URL/api/auth/check-username?username=$(echo "$TRIMMED" | jq -sRr @uri)")
AVAILABLE=$(echo "$RESPONSE" | grep -o '"available":[^,}]*' | cut -d: -f2)
echo "Trimmed \"$TRIMMED\" -> available: $AVAILABLE"

echo ""
echo "=== Diagnostic Complete ==="
echo ""
echo "Next steps:"
echo "1. Check backend console for detailed logs"
echo "2. If issue persists, check database with: cd backend && npx prisma studio"
echo "3. Look for the username in the User table"
echo ""
echo "For network access issues:"
echo "- Make sure CORS_ORIGIN=* in backend/.env"
echo "- Make sure VITE_API_URL points to correct IP in frontend/.env"
echo "- Restart both servers after changing .env files"
