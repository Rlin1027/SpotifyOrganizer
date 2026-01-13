import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

export function getSpotifyClient(accessToken: string) {
    spotifyApi.setAccessToken(accessToken)
    return spotifyApi
}

/**
 * Fetches all Liked Songs (Saved Tracks) for the current user.
 * Handles pagination automatically to get the full list.
 */
export async function getAllLikedSongs(accessToken: string) {
    const client = getSpotifyClient(accessToken)
    let allTracks: SpotifyApi.SavedTrackObject[] = []
    let offset = 0
    const limit = 50

    // Safety break after 2000 songs to avoid effective timeouts during MVP
    const MAX_SONGS = 2000

    while (true) {
        const data = await client.getMySavedTracks({ limit, offset })
        if (!data.body.items.length) break

        allTracks = [...allTracks, ...data.body.items]
        offset += limit

        if (data.body.items.length < limit || allTracks.length >= MAX_SONGS) break
    }

    return allTracks
}

/**
 * Fetches genres for a batch of artist IDs.
 * Spotify API allows up to 50 artists per request.
 */
export async function getArtistsGenres(accessToken: string, artistIds: string[]): Promise<Map<string, string[]>> {
    const client = getSpotifyClient(accessToken)
    const genreMap = new Map<string, string[]>()

    // Process in batches of 50
    for (let i = 0; i < artistIds.length; i += 50) {
        const batch = artistIds.slice(i, i + 50)
        try {
            const data = await client.getArtists(batch)
            data.body.artists.forEach(artist => {
                if (artist) {
                    genreMap.set(artist.id, artist.genres)
                }
            })
        } catch (error) {
            console.error(`Error fetching artists batch ${i}:`, error)
        }
    }

    return genreMap
}



/**
 * Creates a playlist and adds tracks to it.
 */
export async function createPlaylist(accessToken: string, userId: string, name: string, uris: string[], description?: string) {
    const client = getSpotifyClient(accessToken)
    const playlist = await client.createPlaylist(name, {
        description: description || 'Created by Spotify Organizer',
        public: false
    })

    // Add tracks in chunks of 100
    for (let i = 0; i < uris.length; i += 100) {
        const chunk = uris.slice(i, i + 100)
        await client.addTracksToPlaylist(playlist.body.id, chunk)
    }

    return playlist.body
}

// Genre normalization - map specific genres to broader categories
const GENRE_MAPPINGS: Record<string, string> = {
    // Pop
    'pop': 'Pop',
    'dance pop': 'Pop',
    'electro pop': 'Pop',
    'indie pop': 'Pop',
    'synth-pop': 'Pop',
    'k-pop': 'K-Pop',
    'j-pop': 'J-Pop',
    'mandopop': 'Mandopop',
    'c-pop': 'C-Pop',
    'cantopop': 'Cantopop',

    // Rock
    'rock': 'Rock',
    'alternative rock': 'Rock',
    'indie rock': 'Rock',
    'classic rock': 'Rock',
    'hard rock': 'Rock',
    'punk rock': 'Rock',
    'post-rock': 'Rock',

    // Electronic
    'edm': 'Electronic',
    'electronic': 'Electronic',
    'house': 'Electronic',
    'techno': 'Electronic',
    'trance': 'Trance',
    'dubstep': 'Electronic',
    'drum and bass': 'Electronic',

    // Hip-Hop
    'hip hop': 'Hip-Hop',
    'rap': 'Hip-Hop',
    'trap': 'Hip-Hop',

    // R&B
    'r&b': 'R&B',
    'soul': 'R&B',

    // Jazz
    'jazz': 'Jazz',

    // Classical
    'classical': 'Classical',
    'orchestra': 'Classical',

    // Metal
    'metal': 'Metal',
    'heavy metal': 'Metal',
    'death metal': 'Metal',

    // Country
    'country': 'Country',

    // Anime / Game
    'anime': 'Anime',
    'video game music': 'Game',
    'game': 'Game',
}

export function normalizeGenre(genres: string[]): string {
    for (const genre of genres) {
        const lowerGenre = genre.toLowerCase()

        // Check exact matches first
        if (GENRE_MAPPINGS[lowerGenre]) {
            return GENRE_MAPPINGS[lowerGenre]
        }

        // Check partial matches
        for (const [key, value] of Object.entries(GENRE_MAPPINGS)) {
            if (lowerGenre.includes(key)) {
                return value
            }
        }
    }

    // Return the first genre if no mapping found, or "Other"
    return genres.length > 0 ? genres[0] : 'Other'
}
