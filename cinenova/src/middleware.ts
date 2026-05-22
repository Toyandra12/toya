import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "cinenova_session";

function getSecret() {
  const s = process.env.JWT_SECRET ?? "";
  return new TextEncoder().encode(s);
}

async function readSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { sub?: string; email?: string; role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedUser =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders");

  if (!isAdmin && !isAuthPage && !isProtectedUser) {
    return NextResponse.next();
  }

  const sess = await readSession(req);

  if (isAuthPage && sess) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAdmin) {
    if (!sess) return NextResponse.redirect(new URL("/login?next=" + pathname, req.url));
    if (sess.role !== "ADMIN" && sess.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isProtectedUser && !sess) {
    return NextResponse.redirect(new URL("/login?next=" + pathname, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/account/:path*", "/orders/:path*", "/login", "/register"],
};
