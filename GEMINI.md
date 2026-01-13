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
    *   `dashboard/`: Main application interface for authenticated users.
    *   `settings/`: UI for configuring Spotify Client ID and Secret.
    *   `api/`: Backend API routes.
*   `src/lib`: Shared logic.
    *   `spotify.ts`: Core Spotify API interactions (fetch liked songs, create playlists, normalize genres).
    *   `auth.ts`: NextAuth configuration (using a manual credentials provider).
    *   `credentials.ts`: Logic for managing Spotify API credentials (likely handling file-based or DB storage of ID/Secret).

### Authentication Flow

The project uses a hybrid authentication approach:
1.  **Setup:** Users can configure Spotify Client ID/Secret via the `/settings` page if not set in environment variables.
2.  **Login:** Initiated via `/api/spotify/login`.
3.  **Session:** Uses cookies (`spotify_access_token`, `spotify_user`) to manage the active session.
4.  **NextAuth:** Configured in `src/lib/auth.ts` but primarily used for session state structure or future expansion, utilizing a "manual" credentials provider.

### Core Logic (`src/lib/spotify.ts`)

*   **`getAllLikedSongs`**: Fetches user's saved tracks with pagination. *Note: Has a safety limit of 2000 songs.*
*   **`getArtistsGenres`**: Fetches genre information for artists in batches of 50.
*   **`normalizeGenre`**: Maps specific Spotify genres to broader categories (e.g., "indie pop" -> "Pop").
*   **`createPlaylist`**: Creates a new playlist and adds tracks.

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
*   **Data Limits:** Be aware of the 2000 song limit in `getAllLikedSongs` when testing with large libraries.
*   **Tailwind v4:** Uses the latest alpha/beta version of Tailwind CSS.
