#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking TypeScript/TSX syntax errors..."
echo ""

# Run TypeScript compiler check
echo "📝 Running TypeScript compiler check..."
if npm run check --silent; then
    echo -e "${GREEN}✅ TypeScript check passed!${NC}"
    TS_CHECK=0
else
    echo -e "${RED}❌ TypeScript check failed!${NC}"
    TS_CHECK=1
fi

echo ""

# Run ESLint
echo "🔧 Running ESLint..."
if npm run lint --silent; then
    echo -e "${GREEN}✅ ESLint check passed!${NC}"
    LINT_CHECK=0
else
    echo -e "${YELLOW}⚠️  ESLint found some issues${NC}"
    LINT_CHECK=1
fi

echo ""

# Try to build
echo "🏗️  Testing build..."
if npm run build --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    BUILD_CHECK=0
else
    echo -e "${RED}❌ Build failed!${NC}"
    BUILD_CHECK=1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Summary
if [ $TS_CHECK -eq 0 ] && [ $BUILD_CHECK -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Your code is ready.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the errors above.${NC}"
    exit 1
fi
