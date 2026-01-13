import { cookies } from "next/headers"
import Link from "next/link"
import { hasCredentials, getClientIdForDisplay } from "@/lib/credentials"

export default async function Home() {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("spotify_user")
    const user = userCookie ? JSON.parse(userCookie.value) : null

    const credentialsConfigured = await hasCredentials()
    const clientId = await getClientIdForDisplay()

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-neutral-950 text-white">
            {/* Settings Button - Top Right */}
            <div className="absolute top-6 right-6">
                <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    設定
                </Link>
            </div>

            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    Spotify Organizer
                </h1>
            </div>

            <div className="mt-10">
                {user ? (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-xl">Welcome, {user.name}</p>
                        {user.image && (
                            <img
                                src={user.image}
                                alt="Profile"
                                className="w-20 h-20 rounded-full border-2 border-green-500"
                            />
                        )}
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/api/spotify/logout"
                            className="px-6 py-3 bg-red-600 rounded-full hover:bg-red-700 transition"
                        >
                            Sign Out
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        {/* Credential Status */}
                        {credentialsConfigured ? (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                API 已設定 ({clientId ? `${clientId.substring(0, 8)}...` : ''})
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    尚未設定 Spotify API 憑證
                                </div>
                                <Link
                                    href="/settings"
                                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                                >
                                    前往設定 →
                                </Link>
                            </div>
                        )}

                        <a
                            href="/api/spotify/login"
                            className={`px-8 py-4 bg-[#1DB954] text-black font-bold rounded-full text-xl hover:scale-105 transition-transform inline-block ${!credentialsConfigured ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        >
                            Login with Spotify
                        </a>

                        {!credentialsConfigured && (
                            <p className="text-neutral-500 text-sm">請先設定 API 憑證才能登入</p>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}
