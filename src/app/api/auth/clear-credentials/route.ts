import { NextResponse } from 'next/server'
import { clearCredentials } from '@/lib/credentials'

export async function POST() {
    try {
        await clearCredentials()
        return NextResponse.json({ success: true, message: 'Credentials cleared successfully!' })
    } catch (error) {
        console.error('Error clearing credentials:', error)
        return NextResponse.json(
            { error: 'Failed to clear credentials' },
            { status: 500 }
        )
    }
}
