import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"
import { getCredentials } from "@/lib/credentials"

const REDIRECT_URI = "http://127.0.0.1:3000/api/spotify/callback"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
        return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
    }

    if (!code) {
        return NextResponse.redirect(new URL("/?error=no_code", request.url))
    }

    // Get credentials from storage
    const credentials = await getCredentials()
    if (!credentials) {
        return NextResponse.redirect(new URL("/settings?error=no_credentials", request.url))
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${credentials.clientId}:${credentials.clientSecret}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
            }),
        })

        const tokens = await tokenResponse.json()

        if (tokens.error) {
            console.error("Token exchange error:", tokens)
            return NextResponse.redirect(
                new URL(`/?error=${tokens.error}&description=${tokens.error_description}`, request.url)
            )
        }

        // Get user profile
        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        })

        const profile = await profileResponse.json()

        // Store tokens in a cookie (for simplicity in MVP)
        const response = NextResponse.redirect(new URL("/dashboard", request.url))

        // Set secure HTTP-only cookie with token data
        response.cookies.set("spotify_access_token", tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: tokens.expires_in || 3600,
            path: "/",
        })

        response.cookies.set("spotify_refresh_token", tokens.refresh_token || "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        })

        response.cookies.set("spotify_user", JSON.stringify({
            id: profile.id,
            name: profile.display_name,
            email: profile.email,
            image: profile.images?.[0]?.url,
        }), {
            httpOnly: false, // Allow client-side access for display
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        })

        return response
    } catch (error) {
        console.error("Callback error:", error)
        return NextResponse.redirect(new URL("/?error=callback_failed", request.url))
    }
}
