import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const actorPrefix = "/actor";
const producerPrefix = "/producer";
const adminPrefix = "/admin";
const explorePrefix = "/explore";

export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? "dev-only-change-me-32chars!!";
  const token = await getToken({
    req: request,
    secret,
  });

  const { pathname } = request.nextUrl;

  if (pathname.startsWith(explorePrefix)) {
    if (!token) return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith(actorPrefix)) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "ACTOR") return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith(producerPrefix)) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "PRODUCER") return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith(adminPrefix)) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/actor/:path*", "/producer/:path*", "/admin/:path*", "/explore", "/explore/:path*"],
};
