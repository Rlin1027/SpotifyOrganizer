import { cookies } from "next/headers"
import { getAllLikedSongs } from "@/lib/spotify"
import { NextResponse } from "next/server"
import { refreshAccessToken } from "@/lib/tokenRefresh"
import { getCredentials } from "@/lib/credentials"

export async function GET() {
    const cookieStore = await cookies()
    let accessToken = cookieStore.get("spotify_access_token")?.value
    const expiresAtStr = cookieStore.get("spotify_token_expires_at")?.value
    const refreshToken = cookieStore.get("spotify_refresh_token")?.value

    // Check if token needs refresh (5 minute buffer)
    const bufferMs = 5 * 60 * 1000
    const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : 0
    const needsRefresh = !accessToken || (expiresAt && Date.now() > expiresAt - bufferMs)

    if (needsRefresh && refreshToken) {
        const result = await refreshAccessToken()
        if (result && result.accessToken && !result.error) {
            accessToken = result.accessToken
            // Note: Cookies will be updated in the response
        }
    }

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const tracks = await getAllLikedSongs(accessToken)
        const response = NextResponse.json({ tracks })

        // If token was refreshed, update cookies in response
        if (needsRefresh && refreshToken) {
            const result = await refreshAccessToken()
            if (result && result.accessToken && !result.error) {
                response.cookies.set("spotify_access_token", result.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 3600,
                    path: "/",
                })
                response.cookies.set("spotify_token_expires_at", result.expiresAt.toString(), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 3600,
                    path: "/",
                })
            }
        }

        return response
    } catch (error) {
        console.error("Error fetching songs:", error)
        return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 })
    }
}
