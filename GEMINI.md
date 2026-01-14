# Spotify Organizer

**Project Name:** Spotify Organizer (internal: `frozen-kepler`)
**Type:** Next.js Web Application
**Purpose:** Organize Spotify "Liked Songs" into playlists based on genres.

## Overview

Spotify Organizer is a web application built with Next.js 16 that interacts with the Spotify Web API. It allows users to log in with their Spotify account, fetch their liked songs, analyze the genres of the artists, and likely organize these songs into new playlists.

## Technology Stack

*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **Authentication:** Custom Spotify OAuth flow combined with NextAuth v5 (beta).
*   **Spotify API:** `spotify-web-api-node` client wrapper.
*   **Icons:** `lucide-react`.

## Architecture & Key Components

### Directory Structure

*   `src/app`: Application routes (App Router).
    *   `page.tsx`: Landing page. Checks for stored credentials and login status.
    *   `dashboard/`: Main application interface with smart grouping, searching, and playlist management.
    *   `settings/`: UI for configuring Spotify Client ID and Secret.
    *   `components/`: Reusable UI components (Toast, SearchBar, ProgressBar).
    *   `api/`: Backend API routes with auto-token-refresh logic.
*   `src/lib`: Shared logic.
    *   `spotify.ts`: Core Spotify API interactions (fetch liked songs, create playlists, normalize genres).
    *   `tokenRefresh.ts`: Logic for automatically refreshing Spotify Access Tokens using Refresh Tokens.
    *   `auth.ts`: NextAuth configuration (using a manual credentials provider).
    *   `credentials.ts`: Logic for managing Spotify API credentials (likely handling file-based or DB storage of ID/Secret).

### Authentication Flow

The project uses a hybrid authentication approach:
1.  **Setup:** Users can configure Spotify Client ID/Secret via the `/settings` page if not set in environment variables.
2.  **Login:** Initiated via `/api/spotify/login`.
3.  **Session:** Uses cookies (`spotify_access_token`, `spotify_user`) to manage the active session.
4.  **NextAuth:** Configured in `src/lib/auth.ts` but primarily used for session state structure or future expansion, utilizing a "manual" credentials provider.

### Core Logic (`src/lib/spotify.ts`)

*   **`getAllLikedSongs`**: Fetches user's saved tracks with pagination and progress reporting.
*   **`getArtistsGenres`**: Fetches genre information for artists in batches of 50.
*   **`normalizeGenre`**: Maps specific Spotify genres to broader categories using an expanded mapping (150+ genres).
*   **`createPlaylist`**: Creates a new playlist and adds tracks.
*   **`refreshAccessToken`**: (in `tokenRefresh.ts`) Refreshes expired sessions automatically.

### Advanced Features

*   **Duplicate Detection**: Groups tracks by name and artist to identify and filter duplicates.
*   **Playlist Merge**: Allows combining multiple categorized groups into a single smart playlist.
*   **Real-time Search**: Instant filtering of the library by song, artist, or year.
*   **Progress Tracking**: Visual feedback during long-running library fetch operations.

## Development

### specific Commands

*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    *Runs on `http://127.0.0.1:3000`*

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Start Production Server:**
    ```bash
    npm start
    ```

*   **Lint:**
    ```bash
    npm run lint
    ```

## Configuration

*   **Environment Variables:** While standard `.env` support is expected in Next.js, this project emphasizes a UI-based configuration flow (`/settings`) for Spotify Credentials (Client ID/Secret).
*   **Permissions:** The app requires read access to user library (Liked Songs) and write access to playlists.

## Notes for Development

*   **Strict Mode:** React Strict Mode is likely enabled (Next.js default).
*   **Tailwind v4:** Uses the latest version of Tailwind CSS with modern utilities.
*   **Deployment:** Optimized for Vercel deployment with pre-configured `vercel.json`.
