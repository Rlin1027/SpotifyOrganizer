import { cookies } from "next/headers"
import { createPlaylist } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("spotify_access_token")?.value
    const userCookie = cookieStore.get("spotify_user")?.value

    if (!accessToken || !userCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = JSON.parse(userCookie)
        const { name, trackUris, description } = await request.json()

        if (!name || !Array.isArray(trackUris) || trackUris.length === 0) {
            return NextResponse.json({ error: "Playlist name and track URIs are required" }, { status: 400 })
        }

        const playlist = await createPlaylist(accessToken, user.id, name, trackUris, description)

        return NextResponse.json({
            success: true,
            playlist: {
                id: playlist.id,
                name: playlist.name,
                url: playlist.external_urls?.spotify
            }
        })
    } catch (error) {
        console.error("Error creating playlist:", error)
        return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
    }
}
