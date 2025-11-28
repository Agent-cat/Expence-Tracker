# Local CI/CD with Ansible and GitHub Actions

Simple setup where your local machine is both the Ansible control node and Kubernetes host.

## 🚀 Setup Instructions

### 1. Install Required Tools on Your Local Machine

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install KIND (Kubernetes IN Docker)
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Install Ansible
sudo apt update
sudo apt install -y ansible

# Create KIND cluster with port mapping
kind create cluster --config kind-config.yaml --name expense-tracker-cluster
```

### 2. Configure SSH Access to Your Local Machine

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "local-ansible"

# Copy the public key to authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Test SSH connection
ssh localhost "echo SSH works"
```

### 3. Get Your Local Machine IP

```bash
# Get your local IP
ip addr show | grep "inet " | grep -v 127.0.0.1
# Note down the IP address (e.g., 192.168.1.100)
```

### 4. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → Add repository:

**Required Secrets:**

- `DOCKER_HUB_TOKEN`: Your Docker Hub access token
- `LOCAL_MACHINE_IP`: Your local machine IP (from step 3)
- `LOCAL_USER`: Your username (e.g., `vishnu`)
- `LOCAL_SSH_PRIVATE_KEY`: Your SSH private key content (`cat ~/.ssh/id_rsa`)

### 5. Test the Complete Pipeline

```bash
# Commit and push to trigger CI/CD
git add .
git commit -m "Setup local CI/CD with Ansible"
git push origin main
```

## 🔄 How It Works

### CI Pipeline (`.github/workflows/ci.yml`)

1. **Tests**: Runs Maven tests for backend
2. **Build**: Creates Docker images for backend and frontend
3. **Push**: Pushes images to Docker Hub with commit SHA tags

### CD Pipeline (`.github/workflows/cd.yml`)

1. **SSH**: Connects to your local machine via SSH
2. **Ansible**: Runs playbook that:
   - Generates Kubernetes manifests with new image tags
   - Applies manifests to your local minikube cluster
   - Waits for deployments to be ready
3. **Verify**: Shows deployment status

### Ansible Playbook (`ansible/deploy.yml`)

- Dynamically creates manifests with image tags
- Deploys PostgreSQL, backend, and frontend
- Ensures proper service communication
- Waits for each component to be ready

## 🎯 Access Your Applications

After deployment, check the services:

```bash
# Get service URLs
kubectl get services -n expense-tracker

# For KIND, you can access services via mapped ports
# Frontend: http://localhost:30001
# Backend:  http://localhost:30002

# OR use port-forwarding
kubectl port-forward -n expense-tracker service/frontend-service 3000:3000 &
kubectl port-forward -n expense-tracker service/backend-service 8081:8081 &

# Access URLs (port-forwarding):
# Frontend: http://localhost:3000
# Backend:  http://localhost:8081
```

## 📊 Monitor and Debug

```bash
# Check all resources
kubectl get all -n expense-tracker

# View logs
kubectl logs -n expense-tracker deployment/backend
kubectl logs -n expense-tracker deployment/frontend
kubectl logs -n expense-tracker statefulset/postgres

# Check deployment status
kubectl rollout status deployment/backend -n expense-tracker
kubectl rollout status deployment/frontend -n expense-tracker
```

## 🧹 Cleanup

```bash
# Delete everything
kubectl delete namespace expense-tracker

# Stop KIND cluster (optional)
kind delete cluster --name expense-tracker-cluster
```

## 🔧 Troubleshooting

### SSH Issues

```bash
# Test SSH connection
ssh localhost "echo SSH works"

# Check SSH config
cat ~/.ssh/authorized_keys
```

### Kubernetes Issues

```bash
# Check KIND cluster status
kind get clusters

# Check cluster nodes
kubectl get nodes

# Restart KIND cluster
kind delete cluster --name expense-tracker-cluster
kind create cluster --name expense-tracker-cluster
```

### Image Pull Issues

```bash
# Check if images exist
docker images | grep expense-tracker

# Pull images manually
docker pull agentcat1/expense-tracker-backend:latest
docker pull agentcat1/expense-tracker-frontend:latest
```

## 🎉 Benefits

- ✅ **Simple**: Your local machine handles everything
- ✅ **Automated**: GitHub Actions handles CI/CD
- ✅ **Ansible**: Infrastructure as code approach
- ✅ **Kubernetes**: Production-like environment locally
- ✅ **Zero Downtime**: Rolling updates
- ✅ **Versioned**: Images tagged with commit SHA

This setup gives you a complete production-like CI/CD pipeline running entirely on your local machine! 🚀
