# yt-lite — YouTube Clone Demo

A fully functional, static YouTube clone that runs on GitHub Pages. No backend required!

## 🚀 Quick Start (Local)

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## 📁 Project Structure

- `index.html` — Main SPA entry point
- `styles.css` — Dark theme styling with responsive grid
- `app.js` — Client-side routing, video player, comments, likes
- `data/videos.json` — Sample video metadata (public domain videos)

## ✨ Features

- **Video Grid** — Browse videos with thumbnails
- **Search** — Real-time filtering by title/channel
- **Watch Page** — HTML5 video player with controls
- **Likes** — Like/unlike videos (persisted in localStorage)
- **Comments** — Post and view comments (persisted in localStorage)
- **Upload** — Add videos via URL (persisted in localStorage)
- **Responsive Design** — Works on desktop and mobile

## 🌐 Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings** → **Pages**
3. Set source to **main** branch, **/ (root)** folder
4. Save and wait ~1 minute
5. Your site will be live at: `https://<username>.github.io/<repo-name>/`

## 📝 Notes

- This is a **client-side only** demo — no server, database, or authentication
- Video files must be publicly accessible URLs (CORS-enabled)
- Sample videos use public domain content from Blender Foundation
- Comments and likes are stored in browser localStorage
- Upload feature accepts video URLs only (no file uploads to avoid hosting costs)

## 🎨 Customization

Replace sample videos in `data/videos.json` with your own:

```json
{
  "id": "unique-id",
  "title": "Your Video Title",
  "channel": "Channel Name",
  "views": 1000,
  "likes": 50,
  "src": "https://example.com/video.mp4",
  "thumbnail": "https://example.com/thumb.jpg",
  "description": "Video description"
}
```

Enjoy your YouTube clone! 🎬