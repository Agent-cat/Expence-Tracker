#!/bin/bash

# Kubernetes Deployment Script for Expense Tracker

set -e

NAMESPACE="expense-tracker"
DOCKER_HUB_USERNAME="agentcat1"

echo "🚀 Deploying Expense Tracker to Kubernetes..."

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
kubectl apply -f namespace.yaml

# Apply secrets
echo "🔐 Applying secrets..."
kubectl apply -f secrets.yaml

# Deploy database
echo "🗄️ Deploying PostgreSQL..."
kubectl apply -f postgres.yaml

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f backend.yaml

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend.yaml

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n $NAMESPACE --timeout=300s

# Deploy ingress (optional)
echo "🌐 Deploying ingress..."
kubectl apply -f ingress.yaml

echo "✅ Deployment completed!"

# Show status
echo ""
echo "📊 Deployment Status:"
kubectl get all -n $NAMESPACE

echo ""
echo "🔍 Service URLs:"
FRONTEND_IP=$(kubectl get service frontend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
BACKEND_IP=$(kubectl get service backend-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')

if [ "$FRONTEND_IP" != "pending" ] && [ "$FRONTEND_IP" != "" ]; then
    echo "🎨 Frontend: http://$FRONTEND_IP:3000"
else
    echo "🎨 Frontend: LoadBalancer IP pending..."
fi

echo "🔧 Backend: http://$BACKEND_IP:8081"

# Show ingress info
INGRESS_IP=$(kubectl get ingress expense-tracker-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
if [ "$INGRESS_IP" != "pending" ] && [ "$INGRESS_IP" != "" ]; then
    echo "🌐 Ingress: http://$INGRESS_IP (add 'expense-tracker.local' to /etc/hosts)"
else
    echo "🌐 Ingress: LoadBalancer IP pending..."
fi

echo ""
echo "📝 To view logs:"
echo "  kubectl logs -n $NAMESPACE deployment/backend"
echo "  kubectl logs -n $NAMESPACE deployment/frontend"
echo "  kubectl logs -n $NAMESPACE deployment/postgres"

echo ""
echo "🧹 To cleanup:"
echo "  kubectl delete namespace $NAMESPACE"
