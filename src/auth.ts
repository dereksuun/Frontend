import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized({ auth: session, request }) {
      const isInternalRoute = [
        "/dashboard",
        "/onboarding",
        "/contas",
        "/cartoes",
        "/gastos",
        "/metas",
        "/posso-gastar",
        "/configuracoes"
      ].some((path) => request.nextUrl.pathname.startsWith(path));

      if (!isInternalRoute) return true;
      return Boolean(session?.user);
    }
  }
});
