# yt-lite (demo)

This repository contains a small static, client-side "YouTube-like" demo site called `YT-Lite`. It's a GitHub Pages–compatible SPA (single-page app) that demonstrates a video listing, watch page, comments, likes, and a simple upload form that stores metadata in `localStorage`.

Important: this is a demo and not an exact copy of any proprietary service. It intentionally avoids copyrighted UI/brand assets and only uses public-domain/sample videos.

Quick start (locally):

1. Open `index.html` in a browser (or run a simple static server):

   ```bash
   # from workspace root
   python3 -m http.server 8000
   # then open http://localhost:8000
   ```

How it works:
- `index.html` — SPA entry
- `styles.css` — lightweight styling
- `app.js` — routes and UI rendering (client-side)
- `data/videos.json` — sample video metadata

Features:
- Video grid with search
- Watch page with HTML5 `video` player
- Likes (session persisted in `localStorage`)
- Comments persisted in `localStorage`
- Add a new video via URL (persisted in `localStorage`)

Deploy to GitHub Pages:

1. Commit and push to your repository on GitHub.
2. In the repository settings on GitHub, go to "Pages" and select the branch `main` and folder `/ (root)` as source, then save.
3. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/` (usually within a minute or two).

Notes & limitations:
- This is purely static; no server-side streaming, authentication, or rights management.
- Uploaded local files (via file chooser) will only work during the session; to persist a video file you must provide a public URL or host the file in the repo or a CDN.
- Replace sample URLs in `data/videos.json` with your own publicly-hosted MP4s for production.

If you'd like, I can:
- Add a nicer UI and responsive header
- Add thumbnails generated from videos (requires server-side processing)
- Wire uploads to Git LFS or a third-party storage (would need credentials)

Enjoy!
