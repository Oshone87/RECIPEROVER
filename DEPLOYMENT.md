# Vercel Deployment Guide

## Backend Deployment (Vercel)

### 1. Create a new Vercel project for the backend

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Deploy backend
vercel --prod
```

### 2. Set Environment Variables in Vercel Dashboard

Go to your backend project settings in Vercel and add:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/reciperover-prod?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
```

### 3. Get your backend URL

After deployment, you'll get a URL like: `https://reciperover-backend.vercel.app`

## Frontend Deployment (Update existing Vercel deployment)

### 1. Update your existing frontend Vercel project

- Go to your frontend project settings in Vercel
- Add environment variable:

```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

### 2. Update the API client

Replace the backend URL in `client/src/lib/apiClient.ts` with your actual backend Vercel URL.

### 3. Redeploy frontend

```bash
# From your frontend directory
vercel --prod
```

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

- Go to https://www.mongodb.com/atlas
- Create a free account
- Create a new cluster

### 2. Set up Database Access

- Create a database user
- Add IP addresses to whitelist (0.0.0.0/0 for Vercel)

### 3. Get Connection String

- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace <password> with your database user password

## Testing the Deployment

### 1. Test Backend Health

Visit: `https://your-backend-domain.vercel.app/health`
Should return: `{"status": "OK", "environment": "production"}`

### 2. Test Frontend

Visit your frontend URL and try:

- User registration
- Login
- Creating investments
- Admin functions

## Environment Variables Summary

### Backend (Vercel Project Settings):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/reciperover-prod
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
```

### Frontend (Vercel Project Settings):

```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```
