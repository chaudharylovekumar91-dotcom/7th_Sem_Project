# MoodMuse AI Deployment Guide

This guide will walk you through deploying MoodMuse AI to the internet for free using Supabase (Database), Render (Backend), and Vercel (Frontend).

## Step 1: Push Code to GitHub
Both Render and Vercel will deploy your code automatically straight from GitHub.
1. Go to GitHub and create a new repository called `moodmuse-ai`.
2. Push your local project folder to this new repository.

---

## Step 2: Supabase (PostgreSQL Database)
1. Go to [Supabase](https://supabase.com) and create a free account.
2. Create a **New Project**. Note down the database password you create.
3. Once the project finishes provisioning, go to **Project Settings** > **Database**.
4. Scroll down to **Connection String** and copy the URI format. It will look like this:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with the password you created in step 2. **Save this connection string.**

---

## Step 3: Render (FastAPI Backend)
Because our backend relies on Heavy AI libraries like `OpenCV` and `PyTorch`, we use Docker to ensure a smooth installation on the cloud servers.
1. Go to [Render](https://render.com) and create a free account.
2. Click **New** > **Web Service**.
3. Connect your GitHub account and select your `moodmuse-ai` repository.
4. Render will ask for the environment. **Select Docker**.
5. Set the Region to whichever is closest to you.
6. **Environment Variables**: Scroll down and click "Add Environment Variable". Add the following:
   - `DATABASE_URL`: Paste the Supabase connection string from Step 2.
   - `SPOTIPY_CLIENT_ID`: Your Spotify Developer Client ID (optional).
   - `SPOTIPY_CLIENT_SECRET`: Your Spotify Developer Client Secret (optional).
7. Click **Create Web Service**.
8. Render will now build the Docker container (this will take 5-10 minutes because PyTorch is a large package).
9. Once deployed, copy your new Render URL (e.g., `https://moodmuse-backend.onrender.com`).

---

## Step 4: Vercel (React Frontend)
1. Go to [Vercel](https://vercel.com) and create a free account.
2. Click **Add New** > **Project**.
3. Connect your GitHub and import the `moodmuse-ai` repository.
4. **Important Configuration**:
   - Under "Framework Preset", ensure **Vite** is selected.
   - **Root Directory**: Click "Edit" and type `frontend`. (Because the React app is inside the `/frontend` folder).
5. **Environment Variables**: Expand the environment variables section and add:
   - Name: `VITE_API_URL`
   - Value: Paste your Render URL from Step 3 (e.g., `https://moodmuse-backend.onrender.com`). Do not put a trailing slash `/`.
6. Click **Deploy**.
7. Vercel will build the frontend in a few seconds.

---

## Congratulations! 🎉
Your application is now live! You can visit the Vercel URL to view your deployed React application, which securely communicates with your Render backend and Supabase database.
