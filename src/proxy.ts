import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "session";
const PUBLIC_PATHS = ["/login"];

function getSecretKey() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let authenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/whatsapp/webhook|api/cron|_next/static|_next/image|favicon.ico|logo.jpeg).*)",
  ],
};
