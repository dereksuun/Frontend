export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/contas/:path*",
    "/cartoes/:path*",
    "/gastos/:path*",
    "/metas/:path*",
    "/posso-gastar/:path*",
    "/configuracoes/:path*"
  ]
};
