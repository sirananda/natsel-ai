# Natsel.ai

## Deploy to Vercel

### Option A: Vercel CLI
```bash
npm install
npm run build          # Verify it builds locally first
npx vercel --prod      # Deploy
```

### Option B: GitHub → Vercel
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import the repo
3. Vercel auto-detects Vite:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click Deploy

### Option C: Manual Upload
1. Run `npm install && npm run build` locally
2. Upload the `dist/` folder to Vercel via drag-and-drop

### Troubleshooting
- If build fails, ensure Node 18+ is used (set in Vercel → Settings → General → Node.js Version)
- The `.nvmrc` file specifies Node 18
- All source is in `src/App.jsx` (single file React component)
