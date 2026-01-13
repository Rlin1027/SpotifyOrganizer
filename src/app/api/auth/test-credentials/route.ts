import { NextResponse } from 'next/server'
import { getCredentials } from '@/lib/credentials'

export async function POST(request: Request) {
    try {
        // Get credentials from request body (for testing before saving)
        // or from stored cookies (for testing after saving)
        const body = await request.json().catch(() => ({}))

        let clientId: string
        let clientSecret: string

        if (body.clientId && body.clientSecret) {
            // Testing credentials before saving
            clientId = body.clientId
            clientSecret = body.clientSecret
        } else {
            // Testing saved credentials
            const creds = await getCredentials()
            if (!creds) {
                return NextResponse.json(
                    { success: false, error: '尚未設定憑證' },
                    { status: 400 }
                )
            }
            clientId = creds.clientId
            clientSecret = creds.clientSecret
        }

        // Test the credentials by requesting an access token using Client Credentials flow
        // This doesn't require user authorization and is perfect for validation
        const tokenUrl = 'https://accounts.spotify.com/api/token'
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        })

        if (response.ok) {
            const data = await response.json()
            return NextResponse.json({
                success: true,
                message: '✅ 連線成功！憑證有效。',
                tokenType: data.token_type,
                expiresIn: data.expires_in
            })
        } else {
            const errorData = await response.json().catch(() => ({}))

            if (response.status === 401) {
                return NextResponse.json({
                    success: false,
                    error: '❌ 憑證無效。請檢查 Client ID 和 Client Secret 是否正確。'
                }, { status: 401 })
            }

            return NextResponse.json({
                success: false,
                error: `連線失敗: ${errorData.error_description || errorData.error || '未知錯誤'}`
            }, { status: response.status })
        }
    } catch (error) {
        console.error('Error testing credentials:', error)
        return NextResponse.json(
            { success: false, error: '測試時發生錯誤，請稍後再試' },
            { status: 500 }
        )
    }
}
