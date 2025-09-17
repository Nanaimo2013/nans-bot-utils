import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.discordId = profile.id
        token.username = profile.username
        token.discriminator = profile.discriminator
        token.avatar = profile.avatar
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.id = token.discordId as string
      session.user.username = token.username as string
      session.user.discriminator = token.discriminator as string
      session.user.avatar = token.avatar as string
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}
