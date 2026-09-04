import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_PREFIX = "contentai_oauth_";
const MAX_AGE = 600;

export type OAuthState = {
  state: string;
  workspaceId: string;
  userId: string;
  codeVerifier?: string;
  createdAt: number;
};

function cookieName(platform: string) {
  return `${COOKIE_PREFIX}${platform.toLowerCase()}`;
}

export async function createOAuthState(platform: string, value: Omit<OAuthState, "state" | "createdAt">) {
  const state = crypto.randomBytes(32).toString("base64url");
  const payload: OAuthState = { ...value, state, createdAt: Date.now() };
  const cookieStore = await cookies();
  cookieStore.set(cookieName(platform), JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return state;
}

export async function consumeOAuthState(platform: string, expectedState: string) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(cookieName(platform));
  if (!cookie?.value) return null;

  cookieStore.delete(cookieName(platform));
  try {
    const payload = JSON.parse(cookie.value) as OAuthState;
    if (!payload.state || payload.state.length !== expectedState.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(payload.state), Buffer.from(expectedState))) return null;
    if (Date.now() - payload.createdAt > MAX_AGE * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function pkceVerifier() {
  return crypto.randomBytes(48).toString("base64url");
}

export function pkceChallenge(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}
