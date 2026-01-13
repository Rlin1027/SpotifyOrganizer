import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
    const cookieStore = await cookies()

    // Clear all Spotify-related cookies
    cookieStore.delete("spotify_access_token")
    cookieStore.delete("spotify_refresh_token")
    cookieStore.delete("spotify_user")

    return NextResponse.redirect(new URL("/", request.url))
}
