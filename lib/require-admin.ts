import { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "./admin-session";

export async function requireAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
