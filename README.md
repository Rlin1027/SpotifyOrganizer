# 🎵 Spotify Organizer

Organize your Spotify Liked Songs into playlists by **decade**, **genre**, or **mood**.

## ✨ Features

- 📚 **Fetch Liked Songs** - Load your entire Spotify library with progress tracking
- 📅 **Group by Decade** - 2020s, 2010s, 2000s, etc.
- 🎸 **Group by Genre** - 150+ genre mappings (Pop, Rock, Hip-Hop, Latin, K-Pop, etc.)
- 😌 **Group by Mood** - High Energy, Chill, Focus, etc.
- ⚡ **Bulk Create Playlists** - Auto-generate smart playlist names with emojis
- 🔍 **Search & Filter** - Instantly find songs, artists, or albums
- 👯 **Duplicate Detection** - Identify and remove duplicate tracks from your selection
- 🔀 **Playlist Merge** - Combine multiple categories into one custom playlist
- 🌐 **Multilingual** - English & Chinese support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Spotify Developer Account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Rlin1027/SpotifyOrganizer.git
cd SpotifyOrganizer
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment template:
```bash
cp .env.example .env.local
```

4. Configure Spotify credentials:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create an app and get Client ID & Secret
   - Add `http://127.0.0.1:3000/api/spotify/callback` as Redirect URI
   - Update `.env.local` with your credentials

5. Start development server:
```bash
npm run dev
```

6. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

## 🌍 Deploy to Vercel

1. Push your code to GitHub

2. Import project in [Vercel Dashboard](https://vercel.com/new)

3. Add environment variables:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Vercel domain, e.g., `https://your-app.vercel.app`)

4. Update Spotify Dashboard:
   - Add your Vercel URL + `/api/spotify/callback` as Redirect URI

5. Deploy!

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── dashboard/    # Main app UI
│   ├── settings/     # Credentials config
│   └── components/   # Shared components
└── lib/
    ├── spotify.ts    # Spotify API wrapper
    ├── tokenRefresh.ts # Auto token refresh
    └── i18n/         # Translations
```

## 📝 License

MIT
