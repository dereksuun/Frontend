export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/rendas/:path*",
    "/contas/:path*",
    "/cartoes/:path*",
    "/gastos/:path*",
    "/metas/:path*",
    "/posso-gastar/:path*",
    "/investimentos/:path*",
    "/indicadores/:path*",
    "/configuracoes/:path*"
  ]
};
