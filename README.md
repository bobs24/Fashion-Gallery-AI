# Virtual Stylist AI

**Live Application URL:** [https://your-frontend-app-name.fly.dev](https://your-frontend-app-name.fly.dev)  
*Note: Replace `your-username/your-repo-name` and `your-frontend-app-name` with your actual GitHub and Fly.io details.*

---

## Overview

This repository contains the source code for **Virtual Stylist AI**, a full-stack web application that allows users to:

- Browse a fashion catalog.
- Discover visually similar items.
- Use a generative AI to virtually "try-on" products on their own photos.

---

## Key Features

- **AI-Powered Virtual Try-On**: Upload a photo and select a product to generate a photorealistic image of you wearing the item, powered by Google's Gemini 2.5 Flash Image Preview model.  
- **Visual Similarity Search**: Instantly find the 6 most visually similar items from the catalog using a vector database.  
- **Advanced Product Filtering**: Filter products by brand, category, sub-category, and gender, with metadata served from Metabase.  
- **Containerized Architecture**: Docker ensures consistency between development and production environments.  
- **Automated CI/CD**: GitHub Actions automatically builds, tests, and deploys the application to Fly.io on every push to the main branch.

---

## System Architecture

**Modern, decoupled client-server architecture:**

- **Offline Data Pipeline**: Product images are processed through the DinoV2 model to generate vector embeddings, stored in Supabase PostgreSQL with `pgvector` for high-speed similarity searches.  
- **Backend Service**: Python FastAPI backend handles business logic, fetches metadata from Metabase, and securely interacts with the Google Gemini API for image generation.  
- **Frontend Application**: React (TypeScript) SPA served via Nginx, which also acts as a reverse proxy routing API calls securely to the backend.  
- **Deployment**: Separate frontend and backend services on Fly.io with automated GitHub Actions CI/CD pipeline.

---

## Technology Stack

| Category   | Technology                                       |
|------------|-------------------------------------------------|
| Frontend   | React, TypeScript, Vite, Tailwind CSS          |
| Backend    | Python, FastAPI                                 |
| Database   | Supabase (PostgreSQL + pgvector), Metabase     |
| AI / ML    | Google Gemini 2.5 Flash, DinoV2                |
| DevOps     | Docker, Docker Compose, Nginx, GitHub Actions, Fly.io |

---

## Local Development Setup

### Prerequisites

- Docker & Docker Compose  
- A local `.env` file in the `/backend` directory

### Environment Variables

Create `backend/.env` with the following variables:

```dotenv
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_key"
METABASE_URL="your_metabase_url"
METABASE_USERNAME="your_metabase_username"
METABASE_PASSWORD="your_metabase_password"
GOOGLE_API_KEY="your_google_api_key"