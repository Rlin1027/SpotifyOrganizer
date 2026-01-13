import { cookies } from "next/headers"
import { getArtistsGenres, normalizeGenre } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("spotify_access_token")?.value

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { artistIds } = await request.json()

        if (!Array.isArray(artistIds)) {
            return NextResponse.json({ error: "artistIds must be an array" }, { status: 400 })
        }

        // Fetch genres for all artists
        const genreMap = await getArtistsGenres(accessToken, artistIds)

        // Normalize genres
        const normalizedGenres: Record<string, string> = {}
        genreMap.forEach((genres, artistId) => {
            normalizedGenres[artistId] = normalizeGenre(genres)
        })

        return NextResponse.json({ genres: normalizedGenres })
    } catch (error) {
        console.error("Error fetching genres:", error)
        return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
    }
}
