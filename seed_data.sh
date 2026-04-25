#!/bin/bash
set -e

API_URL="http://localhost:8080/api"

echo "1. Logging in as Super Admin..."
ADMIN_LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"lesh@campus.test","password":"lesh@123"}')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESP" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to get admin token. Response: $ADMIN_LOGIN_RESP"
  exit 1
fi
echo "Admin token acquired."

echo "2. Logging in as a regular user via dummy-login..."
USER_LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/dummy-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@campus.test","fullName":"Test Student"}')

USER_TOKEN=$(echo "$USER_LOGIN_RESP" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$USER_TOKEN" ]; then
  echo "Failed to get user token. Response: $USER_LOGIN_RESP"
  exit 1
fi
echo "User token acquired."

echo "3. Creating Resources as Admin..."
curl -s -X POST "$API_URL/resources" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "resourceCode": "HALL-A",
    "name": "Main Lecture Hall",
    "type": "LECTURE_HALL",
    "building": "Engineering Block",
    "status": "ACTIVE",
    "availableFrom": "08:00:00",
    "availableTo": "18:00:00",
    "bookable": true,
    "underMaintenance": false,
    "description": "Large lecture hall with modern equipment.",
    "capacity": 150,
    "hasProjector": true,
    "hasAc": true,
    "hasWhiteboard": true,
    "hasWifi": true,
    "hasComputers": false,
    "hasWindows": true
  }' > /dev/null

curl -s -X POST "$API_URL/resources" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "resourceCode": "LAB-1",
    "name": "Computer Lab 1",
    "type": "LAB",
    "building": "Science Block",
    "status": "ACTIVE",
    "availableFrom": "09:00:00",
    "availableTo": "17:00:00",
    "bookable": true,
    "underMaintenance": false,
    "description": "Lab with high performance workstations.",
    "capacity": 40,
    "hasProjector": true,
    "hasAc": true,
    "hasWhiteboard": true,
    "hasWifi": true,
    "hasComputers": true,
    "hasWindows": false
  }' > /dev/null

echo "Resources created."

echo "4. Fetching the created resources to get their IDs..."
RESOURCES_RESP=$(curl -s -X GET "$API_URL/resources" \
  -H "Authorization: Bearer $USER_TOKEN")

# Simple extraction of the first resource ID
RESOURCE_ID=$(echo "$RESOURCES_RESP" | grep -o '"id":[0-9]*' | head -n 1 | grep -o '[0-9]*')

if [ -z "$RESOURCE_ID" ]; then
  echo "Failed to fetch resource ID."
  exit 1
fi

echo "Found Resource ID: $RESOURCE_ID"

echo "5. Creating a Booking as regular user..."
# Create a booking for tomorrow at 10 AM
TOMORROW=$(date -v+1d "+%Y-%m-%dT10:00:00Z" 2>/dev/null || date -d "+1 day" "+%Y-%m-%dT10:00:00Z")
TOMORROW_END=$(date -v+1d "+%Y-%m-%dT12:00:00Z" 2>/dev/null || date -d "+1 day" "+%Y-%m-%dT12:00:00Z")

curl -s -X POST "$API_URL/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"resourceId\": $RESOURCE_ID,
    \"startTime\": \"$TOMORROW\",
    \"endTime\": \"$TOMORROW_END\",
    \"purpose\": \"Project meeting and discussion\",
    \"attendeeCount\": 5
  }" > /dev/null

echo "Booking created."
echo "Test data successfully added!"
