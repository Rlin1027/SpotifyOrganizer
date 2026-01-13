import { NextResponse } from "next/server"
import { getCredentials } from "@/lib/credentials"

const REDIRECT_URI = "http://127.0.0.1:3000/api/spotify/callback"
const SCOPES = [
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read",
    "playlist-modify-public",
    "playlist-modify-private",
].join(" ")

export async function GET() {
    const credentials = await getCredentials()

    if (!credentials) {
        // Redirect to settings page if no credentials configured
        return NextResponse.redirect(new URL('/settings', 'http://127.0.0.1:3000'))
    }

    const params = new URLSearchParams({
        response_type: "code",
        client_id: credentials.clientId,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
        show_dialog: "true",
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    return NextResponse.redirect(authUrl)
}
