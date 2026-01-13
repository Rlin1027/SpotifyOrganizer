import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("spotify_access_token")?.value
    const userCookie = cookieStore.get("spotify_user")?.value

    if (!accessToken || !userCookie) {
        redirect("/")
    }

    const user = JSON.parse(userCookie)

    return <DashboardClient accessToken={accessToken} user={user} />
}
