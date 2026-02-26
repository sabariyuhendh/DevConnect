#!/bin/bash

# Final Verification Script - Test All Fixed Issues

echo "========================================"
echo "DevConnect - Final Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test function
test_check() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Testing: $name ... "
    result=$(eval "$command" 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        ((FAIL++))
        return 1
    fi
}

echo -e "${BLUE}=== Backend Tests ===${NC}"
echo ""

# Backend health checks
test_check "Backend health (localhost)" \
    "curl -s http://localhost:3001/health" \
    '"status":"ok"'

test_check "Backend health (network)" \
    "curl -s http://10.144.12.192:3001/health" \
    '"status":"ok"'

echo ""
echo -e "${BLUE}=== Authentication Endpoint Tests ===${NC}"
echo ""

# Username check
test_check "Username check (localhost)" \
    "curl -s 'http://localhost:3001/api/auth/check-username?username=testuser123'" \
    '"available"'

test_check "Username check (network)" \
    "curl -s 'http://10.144.12.192:3001/api/auth/check-username?username=testuser456'" \
    '"available"'

# Login endpoint
test_check "Login endpoint (localhost)" \
    "curl -s -X POST http://localhost:3001/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}'" \
    '"message"'

test_check "Login endpoint (network)" \
    "curl -s -X POST http://10.144.12.192:3001/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test\"}'" \
    '"message"'

echo ""
echo -e "${BLUE}=== Configuration Tests ===${NC}"
echo ""

# Check backend configuration
test_check "Backend port configuration" \
    "grep 'PORT=' backend/.env | grep -v '#'" \
    "PORT=3001"

test_check "Backend CORS configuration" \
    "grep 'CORS_ORIGIN=' backend/.env | grep -v '#'" \
    "CORS_ORIGIN=\*"

test_check "Frontend API URL configuration" \
    "grep 'VITE_API_URL=' frontend/.env" \
    "VITE_API_URL=http://10.144.12.192:3001"

echo ""
echo -e "${BLUE}=== File Existence Tests ===${NC}"
echo ""

# Check helper scripts exist
test_check "switch-env.sh exists" \
    "test -f switch-env.sh && echo 'exists'" \
    "exists"

test_check "test-auth-endpoints.sh exists" \
    "test -f test-auth-endpoints.sh && echo 'exists'" \
    "exists"

test_check "start-dev.sh exists" \
    "test -f start-dev.sh && echo 'exists'" \
    "exists"

# Check environment files
test_check "frontend/.env.local exists" \
    "test -f frontend/.env.local && echo 'exists'" \
    "exists"

test_check "frontend/.env.network exists" \
    "test -f frontend/.env.network && echo 'exists'" \
    "exists"

echo ""
echo -e "${BLUE}=== Documentation Tests ===${NC}"
echo ""

test_check "AUTH_ENDPOINTS_FIXED.md exists" \
    "test -f docs/AUTH_ENDPOINTS_FIXED.md && echo 'exists'" \
    "exists"

test_check "PRISMA_SETUP_COMPLETE.md exists" \
    "test -f docs/PRISMA_SETUP_COMPLETE.md && echo 'exists'" \
    "exists"

test_check "AUTH_LOGIN_FIXED.md exists" \
    "test -f AUTH_LOGIN_FIXED.md && echo 'exists'" \
    "exists"

echo ""
echo "========================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "========================================"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! System is ready.${NC}"
    echo ""
    echo "Access URLs:"
    echo "  Frontend (localhost): http://localhost:8081"
    echo "  Frontend (network):   http://10.144.12.192:8081"
    echo "  Backend (localhost):  http://localhost:3001"
    echo "  Backend (network):    http://10.144.12.192:3001"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
