#!/bin/bash

# Test script for DEO Score Recompute Sync endpoint
# Usage: ./test-recompute.sh <email> <password> <projectId>

API_URL="http://localhost:3001"
EMAIL="${1:-your-email@example.com}"
PASSWORD="${2:-your-password}"
PROJECT_ID="${3}"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <email> <password> <projectId>"
  echo ""
  echo "Example:"
  echo "  $0 user@example.com password123 abc-123-project-id"
  exit 1
fi

echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Response:"
  echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

echo "Step 2: Testing recompute-sync endpoint for project: ${PROJECT_ID}"
echo ""

curl -X POST "${API_URL}/projects/${PROJECT_ID}/deo-score/recompute-sync" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""

