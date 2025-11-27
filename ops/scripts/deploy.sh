#!/bin/bash

# Kubernetes Deployment Script for Expense Tracker

set -e

# Get script directory and navigate to ops folder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPS_DIR="$(dirname "$SCRIPT_DIR")"
cd "$OPS_DIR"

NAMESPACE="expense-tracker"
DOCKER_HUB_USERNAME="agentcat1"

echo "🚀 Deploying Expense Tracker to Kubernetes..."
echo "📁 Working from: $OPS_DIR"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster connected"

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f networking/namespace.yaml

# Apply secrets
echo "🔐 Applying secrets..."
kubectl apply -f networking/secrets.yaml

# Deploy database
echo "🗄️ Deploying PostgreSQL..."
kubectl apply -f database/postgres.yaml

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f backend/backend.yaml

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend/frontend.yaml

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=300s

# Deploy ingress (optional - skip for local deployment)
echo "🌐 Skipping ingress for local deployment..."
# kubectl apply -f networking/ingress.yaml

echo "✅ Deployment completed!"

# Show status
echo ""
echo "📊 Deployment Status:"
kubectl get all -n $NAMESPACE

echo ""
echo "🔍 Service Access:"

# Get NodePort information
echo "🎨 Frontend Access Options:"
echo "  NodePort: http://localhost:30001"
echo "  Port-forward: kubectl port-forward -n $NAMESPACE service/frontend-service 3000:3000"

echo ""
echo "🔧 Backend Access Options:"
echo "  NodePort: http://localhost:30002"
echo "  Port-forward: kubectl port-forward -n $NAMESPACE service/backend-service 8081:8081"

echo ""
echo "🚀 Quick Start Commands:"
echo "# Option 1: Use NodePort (recommended for local)"
echo "echo 'Frontend: http://localhost:30001'"
echo "echo 'Backend:  http://localhost:30002'"
echo ""
echo "# Option 2: Use Port Forwarding"
echo "kubectl port-forward -n $NAMESPACE service/frontend-service 3000:3000 &"
echo "kubectl port-forward -n $NAMESPACE service/backend-service 8081:8081 &"
echo "echo 'Frontend: http://localhost:3000'"
echo "echo 'Backend:  http://localhost:8081'"

echo ""
echo "📝 To view logs:"
echo "  kubectl logs -n $NAMESPACE deployment/backend"
echo "  kubectl logs -n $NAMESPACE deployment/frontend"
echo "  kubectl logs -n $NAMESPACE deployment/postgres"

echo ""
echo "🧹 To cleanup:"
echo "  kubectl delete namespace $NAMESPACE"
