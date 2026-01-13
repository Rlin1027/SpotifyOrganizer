import { NextResponse } from 'next/server'
import { saveCredentials } from '@/lib/credentials'

export async function POST(request: Request) {
    try {
        const { clientId, clientSecret } = await request.json()

        // Validate inputs
        if (!clientId || typeof clientId !== 'string' || clientId.length < 10) {
            return NextResponse.json(
                { error: 'Invalid Client ID. It should be a 32-character string.' },
                { status: 400 }
            )
        }

        if (!clientSecret || typeof clientSecret !== 'string' || clientSecret.length < 10) {
            return NextResponse.json(
                { error: 'Invalid Client Secret. It should be a 32-character string.' },
                { status: 400 }
            )
        }

        // Save credentials to cookies
        await saveCredentials(clientId.trim(), clientSecret.trim())

        return NextResponse.json({ success: true, message: 'Credentials saved successfully!' })
    } catch (error) {
        console.error('Error saving credentials:', error)
        return NextResponse.json(
            { error: 'Failed to save credentials' },
            { status: 500 }
        )
    }
}
