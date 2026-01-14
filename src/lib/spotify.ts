import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

export function getSpotifyClient(accessToken: string) {
    spotifyApi.setAccessToken(accessToken)
    return spotifyApi
}

export interface GetLikedSongsOptions {
    /** Optional callback for progress updates */
    onProgress?: (loaded: number, total: number | null) => void
    /** Optional maximum number of songs to fetch (default: no limit) */
    maxSongs?: number
}

/**
 * Fetches all Liked Songs (Saved Tracks) for the current user.
 * Handles pagination automatically to get the full list.
 */
export async function getAllLikedSongs(accessToken: string, options?: GetLikedSongsOptions) {
    const client = getSpotifyClient(accessToken)
    const { onProgress, maxSongs } = options || {}

    let allTracks: SpotifyApi.SavedTrackObject[] = []
    let offset = 0
    const limit = 50
    let total: number | null = null

    while (true) {
        const data = await client.getMySavedTracks({ limit, offset })

        // Get total count from first response
        if (total === null) {
            total = data.body.total
        }

        if (!data.body.items.length) break

        allTracks = [...allTracks, ...data.body.items]
        offset += limit

        // Report progress
        if (onProgress) {
            onProgress(allTracks.length, total)
        }

        // Check if we've reached the end or optional limit
        if (data.body.items.length < limit) break
        if (maxSongs && allTracks.length >= maxSongs) break
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
    'teen pop': 'Pop',
    'art pop': 'Pop',
    'chamber pop': 'Pop',
    'dream pop': 'Pop',
    'power pop': 'Pop',
    'sophisti-pop': 'Pop',

    // Asian Pop
    'k-pop': 'K-Pop',
    'j-pop': 'J-Pop',
    'mandopop': 'Mandopop',
    'c-pop': 'C-Pop',
    'cantopop': 'Cantopop',
    'taiwan pop': 'Mandopop',
    'chinese pop': 'C-Pop',

    // Latin
    'latin': 'Latin',
    'reggaeton': 'Reggaeton',
    'latin pop': 'Latin',
    'latin hip hop': 'Latin',
    'bachata': 'Latin',
    'salsa': 'Latin',
    'merengue': 'Latin',
    'cumbia': 'Latin',
    'dembow': 'Reggaeton',
    'urbano latino': 'Reggaeton',
    'reggaeton flow': 'Reggaeton',
    'trap latino': 'Latin Trap',
    'latin trap': 'Latin Trap',
    'spanish pop': 'Latin',
    'musica mexicana': 'Mexican',
    'corrido': 'Mexican',
    'corridos tumbados': 'Mexican',
    'regional mexican': 'Mexican',
    'mariachi': 'Mexican',
    'ranchera': 'Mexican',
    'banda': 'Mexican',
    'norteno': 'Mexican',
    'sierreno': 'Mexican',

    // Rock
    'rock': 'Rock',
    'alternative rock': 'Rock',
    'indie rock': 'Indie',
    'classic rock': 'Rock',
    'hard rock': 'Rock',
    'punk rock': 'Punk',
    'punk': 'Punk',
    'post-punk': 'Punk',
    'pop punk': 'Punk',
    'post-rock': 'Rock',
    'prog rock': 'Rock',
    'progressive rock': 'Rock',
    'psychedelic rock': 'Rock',
    'garage rock': 'Rock',
    'grunge': 'Rock',
    'shoegaze': 'Indie',

    // Indie / Alternative
    'indie': 'Indie',
    'alternative': 'Alternative',
    'alt-pop': 'Alternative',
    'bedroom pop': 'Indie',
    'lo-fi': 'Lo-Fi',
    'lofi': 'Lo-Fi',
    'chill': 'Chill',

    // Electronic
    'edm': 'Electronic',
    'electronic': 'Electronic',
    'house': 'Electronic',
    'deep house': 'Electronic',
    'tech house': 'Electronic',
    'progressive house': 'Electronic',
    'techno': 'Electronic',
    'trance': 'Trance',
    'dubstep': 'Electronic',
    'drum and bass': 'Electronic',
    'dnb': 'Electronic',
    'future bass': 'Electronic',
    'electro house': 'Electronic',
    'tropical house': 'Electronic',
    'big room': 'Electronic',
    'hardstyle': 'Electronic',
    'ambient': 'Ambient',
    'synthwave': 'Synthwave',
    'retrowave': 'Synthwave',
    'chillwave': 'Chill',
    'vaporwave': 'Vaporwave',

    // Hip-Hop / Rap
    'hip hop': 'Hip-Hop',
    'rap': 'Hip-Hop',
    'trap': 'Hip-Hop',
    'drill': 'Hip-Hop',
    'boom bap': 'Hip-Hop',
    'conscious hip hop': 'Hip-Hop',
    'gangster rap': 'Hip-Hop',
    'southern hip hop': 'Hip-Hop',
    'west coast rap': 'Hip-Hop',
    'east coast hip hop': 'Hip-Hop',
    'trap soul': 'Hip-Hop',
    'cloud rap': 'Hip-Hop',
    'emo rap': 'Hip-Hop',
    'mumble rap': 'Hip-Hop',

    // R&B / Soul
    'r&b': 'R&B',
    'rnb': 'R&B',
    'soul': 'Soul',
    'neo soul': 'Soul',
    'contemporary r&b': 'R&B',
    'urban contemporary': 'R&B',
    'funk': 'Funk',
    'disco': 'Disco',
    'nu-disco': 'Disco',

    // Jazz
    'jazz': 'Jazz',
    'smooth jazz': 'Jazz',
    'jazz fusion': 'Jazz',
    'bebop': 'Jazz',
    'swing': 'Jazz',
    'vocal jazz': 'Jazz',
    'acid jazz': 'Jazz',

    // Blues
    'blues': 'Blues',
    'blues rock': 'Blues',
    'delta blues': 'Blues',
    'chicago blues': 'Blues',
    'rhythm and blues': 'Blues',

    // Classical
    'classical': 'Classical',
    'orchestra': 'Classical',
    'orchestral': 'Classical',
    'opera': 'Classical',
    'baroque': 'Classical',
    'romantic': 'Classical',
    'contemporary classical': 'Classical',
    'piano': 'Classical',
    'symphony': 'Classical',

    // Metal
    'metal': 'Metal',
    'heavy metal': 'Metal',
    'death metal': 'Metal',
    'black metal': 'Metal',
    'thrash metal': 'Metal',
    'power metal': 'Metal',
    'doom metal': 'Metal',
    'metalcore': 'Metal',
    'deathcore': 'Metal',
    'nu metal': 'Metal',
    'progressive metal': 'Metal',
    'symphonic metal': 'Metal',

    // Country / Folk
    'country': 'Country',
    'country rock': 'Country',
    'country pop': 'Country',
    'americana': 'Country',
    'bluegrass': 'Country',
    'folk': 'Folk',
    'indie folk': 'Folk',
    'folk rock': 'Folk',
    'singer-songwriter': 'Folk',
    'acoustic': 'Acoustic',

    // Reggae / Caribbean
    'reggae': 'Reggae',
    'dancehall': 'Reggae',
    'dub': 'Reggae',
    'ska': 'Reggae',
    'soca': 'Caribbean',

    // World / International
    'afrobeats': 'Afrobeats',
    'afrobeat': 'Afrobeats',
    'afro pop': 'Afrobeats',
    'afropop': 'Afrobeats',
    'amapiano': 'Amapiano',
    'bossa nova': 'Brazilian',
    'samba': 'Brazilian',
    'brazilian': 'Brazilian',
    'mpb': 'Brazilian',
    'funk carioca': 'Brazilian',
    'bollywood': 'Bollywood',
    'indian pop': 'Bollywood',
    'turkish pop': 'World',
    'arabic pop': 'World',
    'world': 'World',
    'world music': 'World',

    // Anime / Game / Soundtrack
    'anime': 'Anime',
    'j-rock': 'J-Rock',
    'visual kei': 'J-Rock',
    'video game music': 'Game',
    'game': 'Game',
    'soundtrack': 'Soundtrack',
    'ost': 'Soundtrack',
    'movie tunes': 'Soundtrack',
    'film score': 'Soundtrack',

    // Other
    'christmas': 'Holiday',
    'holiday': 'Holiday',
    'worship': 'Gospel',
    'gospel': 'Gospel',
    'christian': 'Gospel',
    'ccm': 'Gospel',
    'new age': 'New Age',
    'meditation': 'New Age',
    'sleep': 'New Age',
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
