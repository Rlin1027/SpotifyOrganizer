import { NextResponse } from 'next/server'
import { getClientIdForDisplay, hasCredentials } from '@/lib/credentials'

export async function GET() {
    try {
        const configured = await hasCredentials()
        const clientId = await getClientIdForDisplay()

        // Mask the client ID for display (show first 8 and last 4 characters)
        let maskedClientId = null
        if (clientId) {
            if (clientId.length > 12) {
                maskedClientId = `${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 4)}`
            } else {
                maskedClientId = clientId
            }
        }

        return NextResponse.json({
            configured,
            clientId: maskedClientId,
            source: clientId ? (process.env.SPOTIFY_CLIENT_ID === clientId ? 'environment' : 'user') : null
        })
    } catch (error) {
        console.error('Error checking credentials:', error)
        return NextResponse.json(
            { error: 'Failed to check credentials' },
            { status: 500 }
        )
    }
}
