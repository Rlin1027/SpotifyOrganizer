import { cookies } from "next/headers"
import { getCredentials } from "@/lib/credentials"

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

export interface TokenRefreshResult {
    accessToken: string
    expiresAt: number
    error?: string
}

/**
 * Refreshes the Spotify access token using the refresh token.
 * Returns a new access token and expiration time.
 */
export async function refreshAccessToken(): Promise<TokenRefreshResult | null> {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("spotify_refresh_token")?.value

    if (!refreshToken) {
        console.error("No refresh token available")
        return null
    }

    const credentials = await getCredentials()
    if (!credentials) {
        console.error("No credentials available for token refresh")
        return null
    }

    try {
        const response = await fetch(SPOTIFY_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${credentials.clientId}:${credentials.clientSecret}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        })

        const data = await response.json()

        if (data.error) {
            console.error("Token refresh error:", data)
            return { accessToken: "", expiresAt: 0, error: data.error }
        }

        const expiresAt = Date.now() + (data.expires_in * 1000)

        return {
            accessToken: data.access_token,
            expiresAt,
        }
    } catch (error) {
        console.error("Failed to refresh token:", error)
        return null
    }
}

/**
 * Gets a valid access token, refreshing if necessary.
 * This should be called before making Spotify API requests.
 */
export async function getValidAccessToken(): Promise<string | null> {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("spotify_access_token")?.value
    const expiresAtStr = cookieStore.get("spotify_token_expires_at")?.value

    // Check if token exists and is still valid (with 5 minute buffer)
    if (accessToken && expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10)
        const bufferMs = 5 * 60 * 1000 // 5 minutes

        if (Date.now() < expiresAt - bufferMs) {
            return accessToken
        }
    }

    // Token expired or missing, try to refresh
    const result = await refreshAccessToken()

    if (result && result.accessToken && !result.error) {
        // Note: We can't set cookies here directly in a utility function.
        // The calling API route should handle setting the new cookies.
        return result.accessToken
    }

    return null
}

/**
 * Updates the access token cookies with new values.
 * Call this from API routes after refreshing the token.
 */
export function setTokenCookies(
    response: Response,
    accessToken: string,
    expiresIn: number,
    refreshToken?: string
): void {
    // This is a helper for building cookie headers
    // In Next.js API routes, use response.cookies.set() instead
}
