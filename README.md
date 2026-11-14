# CampusMart

CampusMart is a React/Vite marketplace client and Express/MongoDB API. The Vercel deployment serves the client and the API from one public URL.

## Run locally

From the repository root, install the npm workspaces once:

```powershell
npm install
```

Configure MongoDB and Cloudinary in `server/.env` using `server/.env.example`. Then start the API and frontend in separate terminals:

```powershell
npm run dev --workspace=server
```

```powershell
npm run dev --workspace=client
```

Open the URL printed by Vite, usually `http://localhost:5173`. Vite proxies `/api` requests to the local Express server on port 5000.

## Deploy to Vercel

1. Push the repository to GitHub. Do not commit `server/.env` or paste secret values into the repository.
2. In Vercel, choose **Add New → Project** and import `ranask112021-star/CampusMart`.
3. Keep the **Root Directory** set to the repository root. The root npm workspaces install the frontend and backend dependencies.
4. Use the repository's `vercel.json` settings: build command `npm run build` and output directory `client/dist`.
5. Add these environment variables in the Vercel project settings for Production (and Preview too, if preview deployments need them):
   - `MONGO_URI` - MongoDB Atlas connection string.
   - `JWT_SECRET` - a long, unique random secret.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - required for listing photo uploads.
   - `NODE_ENV` - set to `production`.
6. Deploy, then check `https://<your-vercel-domain>/api/health`. A healthy response includes `{"status":"ok","database":"connected"}`.
7. Open the Vercel domain and test registration, login, and a listing. Share that public URL with visitors.

The API is a Vercel serverless function. MongoDB Atlas must allow connections from the deployed function. Vercel's function request-size limits also apply to listing photo uploads, so keep uploaded images small. This project currently uses Cash on Delivery only; no online payment is collected. Password reset is disabled in production until an email provider is configured. Local sample listings are for display/demo only and are not real inventory.
