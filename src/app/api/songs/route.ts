import { cookies } from "next/headers"
import { getAllLikedSongs } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function GET() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("spotify_access_token")?.value

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const tracks = await getAllLikedSongs(accessToken)
        return NextResponse.json({ tracks })
    } catch (error) {
        console.error("Error fetching songs:", error)
        return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 })
    }
}
