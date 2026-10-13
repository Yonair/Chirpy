import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, validateJWT } from "./api/auth.js";
import { Request } from "express";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Generation and Validation", () => {
  const userID = "user123";
  const expiresIn = 60; // 1 minute
  const secret = "mySecretKey";
  let token: string;

  beforeAll(() => {
    token = makeJWT(userID, expiresIn, secret);
  });

  it("should validate the JWT and return the correct user ID", () => {
    const validatedUserID = validateJWT(token, secret);
    expect(validatedUserID).toBe(userID);
  });

  it("should throw an error for an invalid token", () => {
    expect(() => validateJWT("invalidToken", secret)).toThrowError("Invalid or expired token");
  });
  it("should throw an error for an expired token", () => {
    const expiredToken = makeJWT(userID, -1000, secret); // Token that expired 1 second ago
    expect(() => validateJWT(expiredToken, secret)).toThrowError("Invalid or expired token");
  });
});

describe("JWT Authorization Header Extraction", () => {
  it("should extract the Bearer token from the Authorization header", () => {
    const req = {
      headers: new Map([["Authorization", "Bearer myToken123"]]),
    } as unknown as Request;

    const token = getBearerToken(req);
    expect(token).toBe("myToken123");
  });

  it(" should throw an error if the Authorization header is missing", () => {
    const req = {
      headers: new Map(),
    } as unknown as Request;

    expect(() => getBearerToken(req)).toThrowError("Missing or invalid Authorization header");
  });

  it("should throw an error if the Authorization header does not start with 'Bearer '", () => {
    const req = {
      headers: new Map([["Authorization", "Basic myToken123"]]),
    } as unknown as Request;

    expect(() => getBearerToken(req)).toThrowError("Missing or invalid Authorization header");
  });
});
