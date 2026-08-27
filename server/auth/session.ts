import type { Request } from "express";
import { parseCookie } from "cookie";
import { jwtVerify } from "jose";

export type SessionActor = { userId: number };

const SESSION_COOKIE = "nightingale_session";

function readTestActor(request: Request): SessionActor | undefined {
  if (process.env.NODE_ENV !== "test" && !process.env.VITEST) return undefined;
  const value = request.header("x-nightingale-test-actor");
  if (!value) return undefined;
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? { userId } : undefined;
}

/**
 * Resolves identity exclusively on the server. Tests can use a test-only header;
 * normal requests require a verified, signed session cookie and never accept a role from the browser.
 */
export async function getActorFromSession(request: Request): Promise<SessionActor | undefined> {
  const testActor = readTestActor(request);
  if (testActor) return testActor;

  const token = parseCookie(request.headers.cookie ?? "")[SESSION_COOKIE];
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return undefined;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = Number(payload.userId);
    return Number.isInteger(userId) && userId > 0 ? { userId } : undefined;
  } catch {
    return undefined;
  }
}
