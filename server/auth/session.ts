import type { Request } from "express";
import { parseCookie } from "cookie";
import { jwtVerify } from "jose";

export type SessionActor = { userId: number; clinicId?: number };

const SESSION_COOKIE = "nightingale_session";
const PREVIEW_TOKEN_HEADER = "x-nightingale-preview-token";

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

  const secret = process.env.JWT_SECRET;
  if (!secret) return undefined;

  const previewToken = request.header(PREVIEW_TOKEN_HEADER);
  if (process.env.NODE_ENV !== "production" && previewToken) {
    try {
      const { payload } = await jwtVerify(previewToken, new TextEncoder().encode(secret));
      const userId = Number(payload.userId);
      const clinicId = Number(payload.clinicId);
      if (payload.preview === "synthetic_staff" && Number.isInteger(userId) && userId > 0 && Number.isInteger(clinicId) && clinicId > 0) {
        return { userId, clinicId };
      }
    } catch {
      return undefined;
    }
  }

  const token = parseCookie(request.headers.cookie ?? "")[SESSION_COOKIE];
  if (!token) return undefined;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = Number(payload.userId);
    const clinicId = Number(payload.clinicId);
    if (!Number.isInteger(userId) || userId <= 0) return undefined;
    return Number.isInteger(clinicId) && clinicId > 0 ? { userId, clinicId } : { userId };
  } catch {
    return undefined;
  }
}
