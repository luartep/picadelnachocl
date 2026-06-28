import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-session";

// Next.js 16 renombró "middleware.ts" a "proxy.ts" (corre en Node.js runtime,
// no en Edge). Mantenemos Web Crypto API en lib/admin-session.ts de todas
// formas: es compatible con ambos entornos y nunca lanza una excepción no
// controlada si falta la variable de entorno del secreto.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login siempre es accesible (si no, nadie podría loguearse).
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifySessionToken(token);

  if (!isValid) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
