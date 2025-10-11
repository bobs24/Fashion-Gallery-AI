# 🧥 Virtual Stylist AI

**Virtual Stylist AI** is a full-stack web application that leverages **generative AI** and **vector search** to provide a next-generation **virtual try-on experience** for fashion e-commerce.

**🔗 Live Application URL:** [http://YOUR_EC2_PUBLIC_IP](http://YOUR_EC2_PUBLIC_IP)

---

## 🧩 Overview

Virtual Stylist AI is a **containerized**, **cloud-native** application that allows users to:
- Browse a fashion catalog
- Discover visually similar items using vector embeddings
- Generate photorealistic images of themselves wearing products

The project features a **decoupled frontend and backend**, deployed on **AWS EC2**, and includes a **fully automated CI/CD pipeline** using **GitHub Actions**.

---

## 🚀 Key Features

- **🎨 AI-Powered Virtual Try-On:**  
  Utilizes *Google’s Gemini 2.5 Flash Image Preview* model to generate high-quality images of users wearing selected apparel.

- **🔍 Visual Similarity Search:**  
  Uses *DinoV2* to generate vector embeddings for the product catalog, enabling high-speed similarity search with **Supabase’s pgvector**.

- **🧭 Advanced Product Filtering:**  
  Integrates with **Metabase** to provide rich metadata filtering by brand, category, sub-category, and gender.

- **🐳 Containerized Architecture:**  
  Fully containerized with **Docker**, ensuring consistent environments from local development to production.

- **⚙️ Automated CI/CD Pipeline:**  
  A **GitHub Actions** workflow automates build, push, and deploy steps — including Docker image creation and EC2 deployment via SSH.

---

## 🏗️ System Architecture

### 🧮 Offline Data Pipeline
An offline process uses **DinoV2** to convert product images into vector embeddings, stored and indexed in **Supabase PostgreSQL** with **pgvector**.

### 🧠 Backend Service
A **FastAPI** backend handles:
- Business logic
- Data orchestration from Supabase & Metabase
- Vector similarity searches
- Secure communication with Google Gemini API

### 🖥️ Frontend Application
A responsive **React (TypeScript)** single-page app served via **Nginx**, providing a seamless user experience.

### ☁️ Deployment Infrastructure
Two Docker containers run on **AWS EC2**:
- **Nginx container:** Serves the frontend & acts as reverse proxy
- **FastAPI container:** Handles API requests

---

## 🧰 Technology Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **Database** | Supabase (PostgreSQL + pgvector), Metabase |
| **AI / ML** | Google Gemini 2.5 Flash, ViT |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions, AWS EC2, Docker Hub |

---

## 💻 Local Development

### 🔧 Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- Local `.env` file in the `/backend` directory

### ⚙️ Environment Variables

Create `backend/.env` file with:

```bash
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_key"
METABASE_URL="your_metabase_url"
METABASE_USERNAME="your_metabase_username"
METABASE_PASSWORD="your_metabase_password"
GOOGLE_API_KEY="your_google_api_key"
```

### ▶️ Running Locally

From the project’s root directory, run:

```bash
docker-compose up --build
```

The application will be available at:  
👉 **http://localhost:3000**

---

## 🚢 Production Deployment & CI/CD

This project uses **GitHub Actions** for **fully automated CI/CD**.  
The workflow is defined in `.github/workflows/deploy.yml` and runs on every push to the `master` branch.

### 🛠️ CI/CD Workflow Steps

1. **Build Images:**  
   Builds Docker images for frontend and backend.

2. **Push to Registry:**  
   Pushes images to **Docker Hub**.

3. **Deploy to EC2:**  
   - Connects to AWS EC2 via SSH  
   - Creates `.env` and `docker-compose.yml` from GitHub Secrets  
   - Pulls the latest Docker images  
   - Restarts containers with new versions

---

### 🔐 Required GitHub Secrets

| Secret | Description |
|---------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SSH_HOST` | EC2 public IP |
| `SSH_USERNAME` | e.g. `ec2-user` or `ubuntu` |
| `SSH_KEY` | Private SSH key for EC2 |
| `DOCKER_COMPOSE_PROD` | Content of production `docker-compose.yml` |
| *App Environment Vars* | `SUPABASE_URL`, `GOOGLE_API_KEY`, etc. |

---

### 🧠 Summary

Virtual Stylist AI seamlessly combines **AI-powered image generation**, **vector similarity search**, and **cloud-native DevOps** to deliver an innovative virtual try-on experience for online fashion retail.
