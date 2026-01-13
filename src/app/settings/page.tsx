import SettingsClient from './SettingsClient'

export const metadata = {
    title: 'Settings | Spotify Organizer',
    description: 'Configure your Spotify API credentials',
}

export default function SettingsPage() {
    return <SettingsClient />
}
