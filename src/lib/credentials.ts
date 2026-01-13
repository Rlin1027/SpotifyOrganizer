import { cookies } from 'next/headers'

// Simple XOR-based obfuscation for the client secret
// Note: This is NOT cryptographic security, but provides basic protection
// For production, use proper encryption with a server-side key
const OBFUSCATION_KEY = 'spotify-organizer-2024'

function obfuscate(text: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
        result += String.fromCharCode(charCode)
    }
    return Buffer.from(result).toString('base64')
}

function deobfuscate(encoded: string): string {
    const decoded = Buffer.from(encoded, 'base64').toString()
    let result = ''
    for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)
        result += String.fromCharCode(charCode)
    }
    return result
}

export interface SpotifyCredentials {
    clientId: string
    clientSecret: string
}

/**
 * Save Spotify credentials to cookies
 */
export async function saveCredentials(clientId: string, clientSecret: string): Promise<void> {
    const cookieStore = await cookies()

    // Store Client ID as plain text (not secret)
    cookieStore.set('spotify_client_id', clientId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/'
    })

    // Store Client Secret with obfuscation
    cookieStore.set('spotify_client_secret', obfuscate(clientSecret), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/'
    })
}

/**
 * Get Spotify credentials from cookies
 * Falls back to environment variables if cookies are not set
 */
export async function getCredentials(): Promise<SpotifyCredentials | null> {
    const cookieStore = await cookies()

    const clientIdCookie = cookieStore.get('spotify_client_id')?.value
    const clientSecretCookie = cookieStore.get('spotify_client_secret')?.value

    // First try cookies
    if (clientIdCookie && clientSecretCookie) {
        return {
            clientId: clientIdCookie,
            clientSecret: deobfuscate(clientSecretCookie)
        }
    }

    // Fallback to environment variables
    const envClientId = process.env.SPOTIFY_CLIENT_ID
    const envClientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (envClientId && envClientSecret) {
        return {
            clientId: envClientId,
            clientSecret: envClientSecret
        }
    }

    return null
}

/**
 * Check if credentials are configured (either in cookies or env)
 */
export async function hasCredentials(): Promise<boolean> {
    const creds = await getCredentials()
    return creds !== null
}

/**
 * Clear stored credentials from cookies
 */
export async function clearCredentials(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('spotify_client_id')
    cookieStore.delete('spotify_client_secret')
}

/**
 * Get just the client ID for display (safe to show in UI)
 */
export async function getClientIdForDisplay(): Promise<string | null> {
    const cookieStore = await cookies()

    const clientIdCookie = cookieStore.get('spotify_client_id')?.value
    if (clientIdCookie) return clientIdCookie

    const envClientId = process.env.SPOTIFY_CLIENT_ID
    if (envClientId) return envClientId

    return null
}
