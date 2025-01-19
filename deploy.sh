#!/bin/bash

# Script para hacer deploy de todas las Cloud Functions
# Equivalente a serverless deploy pero manual

echo "🚀 Deploying all Cloud Functions..."

# Función 1: Get Tasks
echo "📋 Deploying get-tasks function..."
gcloud functions deploy get-tasks \
  --source=./functions/get-tasks \
  --entry-point=getTasks \
  --runtime=nodejs18 \
  --trigger=http \
  --allow-unauthenticated \
  --region=us-central1 \
  --memory=256MB \
  --timeout=60s

# Función 2: Create Task
echo "➕ Deploying create-task function..."
gcloud functions deploy create-task \
  --source=./functions/create-task \
  --entry-point=createTask \
  --runtime=nodejs18 \
  --trigger=http \
  --allow-unauthenticated \
  --region=us-central1 \
  --memory=256MB \
  --timeout=60s

# Función 3: Get Single Task
echo "🔍 Deploying get-task function..."
gcloud functions deploy get-task \
  --source=./functions/get-task \
  --entry-point=getTask \
  --runtime=nodejs18 \
  --trigger=http \
  --allow-unauthenticated \
  --region=us-central1 \
  --memory=256MB \
  --timeout=60s

# Función 4: Update Task
echo "✏️ Deploying update-task function..."
gcloud functions deploy update-task \
  --source=./functions/update-task \
  --entry-point=updateTask \
  --runtime=nodejs18 \
  --trigger=http \
  --allow-unauthenticated \
  --region=us-central1 \
  --memory=256MB \
  --timeout=60s

# Función 5: Delete Task
echo "🗑️ Deploying delete-task function..."
gcloud functions deploy delete-task \
  --source=./functions/delete-task \
  --entry-point=deleteTask \
  --runtime=nodejs18 \
  --trigger=http \
  --allow-unauthenticated \
  --region=us-central1 \
  --memory=256MB \
  --timeout=60s

echo "✅ All functions deployed successfully!"
echo "🌐 Your functions are available at:"
echo "GET    https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/get-tasks"
echo "POST   https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/create-task"
echo "GET    https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/get-task?id=1"
echo "PUT    https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/update-task?id=1"
echo "DELETE https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/delete-task?id=1"