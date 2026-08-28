import type { Request } from "express";
import { SignJWT } from "jose";
import { afterEach, describe, expect, it } from "vitest";
import { getActorFromSession } from "./session";

const originalNodeEnv = process.env.NODE_ENV;
const originalSecret = process.env.JWT_SECRET;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.JWT_SECRET = originalSecret;
});

function requestWithPreviewToken(token?: string) {
  return {
    headers: {},
    header(name: string) {
      return name === "x-nightingale-preview-token" ? token : undefined;
    },
  } as unknown as Request;
}

describe("development synthetic Staff preview token", () => {
  it("accepts a short-lived server-signed Staff preview token only outside production", async () => {
    process.env.NODE_ENV = "development";
    process.env.JWT_SECRET = "test-preview-secret";
    const token = await new SignJWT({ userId: "71", clinicId: "90001", preview: "synthetic_staff" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    await expect(getActorFromSession(requestWithPreviewToken(token))).resolves.toEqual({ userId: 71, clinicId: 90001 });
  });

  it("accepts a signed Patient preview token only outside production", async () => {
    process.env.NODE_ENV = "development";
    process.env.JWT_SECRET = "test-preview-secret";
    const token = await new SignJWT({ userId: "72", clinicId: "90001", preview: "synthetic_patient" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    await expect(getActorFromSession(requestWithPreviewToken(token))).resolves.toEqual({ userId: 72, clinicId: 90001 });
  });

  it("rejects the development preview token in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "test-preview-secret";
    const token = await new SignJWT({ userId: "71", clinicId: "90001", preview: "synthetic_staff" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    await expect(getActorFromSession(requestWithPreviewToken(token))).resolves.toBeUndefined();
  });
});
