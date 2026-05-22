import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { User, UserRole } from "@prisma/client";

const COOKIE_NAME = "cinenova_session";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET is missing or too short. Set it in .env (min 16 chars).");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload) {
  const expires = process.env.JWT_EXPIRES_IN ?? "7d";
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub === "string" && typeof (payload as any).email === "string") {
      return payload as unknown as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser(): Promise<User | null> {
  const sess = await readSessionCookie();
  if (!sess) return null;
  return prisma.user.findUnique({ where: { id: sess.sub } });
}

export const SESSION_COOKIE = COOKIE_NAME;
