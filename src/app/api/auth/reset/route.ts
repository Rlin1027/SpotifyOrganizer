import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Reset API - Clears all stored data:
 * - Spotify API credentials (Client ID, Client Secret)
 * - User session (access token, refresh token, user info)
 * 
 * This is a "factory reset" for the application.
 */
export async function POST() {
    try {
        const cookieStore = await cookies()
        
        // List of all cookies used by the application
        const cookiesToClear = [
            // Credentials
            'spotify_client_id',
            'spotify_client_secret',
            // Session
            'spotify_access_token',
            'spotify_refresh_token',
            'spotify_user',
        ]
        
        // Delete each cookie
        for (const cookieName of cookiesToClear) {
            cookieStore.delete(cookieName)
        }
        
        return NextResponse.json({
            success: true,
            message: '✅ 已成功清除所有資料！應用程式已重置。',
            cleared: cookiesToClear
        })
    } catch (error) {
        console.error('Error resetting application:', error)
        return NextResponse.json(
            { success: false, error: '重置時發生錯誤' },
            { status: 500 }
        )
    }
}

/**
 * GET endpoint to check current stored data status
 */
export async function GET() {
    try {
        const cookieStore = await cookies()
        
        const status = {
            credentials: {
                clientId: !!cookieStore.get('spotify_client_id')?.value,
                clientSecret: !!cookieStore.get('spotify_client_secret')?.value,
            },
            session: {
                accessToken: !!cookieStore.get('spotify_access_token')?.value,
                refreshToken: !!cookieStore.get('spotify_refresh_token')?.value,
                user: !!cookieStore.get('spotify_user')?.value,
            }
        }
        
        const hasAnyData = 
            status.credentials.clientId || 
            status.credentials.clientSecret ||
            status.session.accessToken ||
            status.session.refreshToken ||
            status.session.user
        
        return NextResponse.json({
            hasData: hasAnyData,
            status
        })
    } catch (error) {
        console.error('Error checking status:', error)
        return NextResponse.json(
            { error: '無法取得狀態' },
            { status: 500 }
        )
    }
}
