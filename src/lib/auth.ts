import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// We'll use Credentials provider just to maintain session state
// The actual OAuth flow will be handled manually in API routes

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      id: "spotify-manual",
      name: "Spotify",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        userId: { label: "User ID", type: "text" },
        userName: { label: "User Name", type: "text" },
        userImage: { label: "User Image", type: "text" },
        userEmail: { label: "User Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken) {
          return null
        }
        return {
          id: credentials.userId as string,
          name: credentials.userName as string,
          email: credentials.userEmail as string,
          image: credentials.userImage as string,
          accessToken: credentials.accessToken as string,
          refreshToken: credentials.refreshToken as string,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error - Custom properties
        token.accessToken = user.accessToken
        // @ts-expect-error - Custom properties
        token.refreshToken = user.refreshToken
      }
      return token
    },
    async session({ session, token }) {
      // @ts-expect-error - Custom properties
      session.accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
