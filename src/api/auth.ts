import * as argon2  from "argon2";
import jwt from "jsonwebtoken"
import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        console.error(err);
    }
    return "";
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
   try {
    if (await argon2.verify(hash, password)) {
        return true;
    } else {
        return false;
    }
} catch (err) {
    console.error(err);}
    return false;
};

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const payload: payload = {
        iss: "chirpy",
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
    }
    return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (err) {
        throw new UserNotAuthenticatedError("Invalid or expired token");
    }
    if (!decoded || !decoded.sub) {
        throw new UserNotAuthenticatedError("Invalid or expired token");
    }
    return decoded.sub;
}

export function getBearerToken(req: Request): string {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthenticatedError("Missing or invalid Authorization header");
    }
    if (!authHeader.startsWith("Bearer ")) {
        throw new BadRequestError("Missing or invalid Authorization header");
    }
    return authHeader.substring(7).trim();
};

export function makeRefreshToken() {
    const hexString = crypto.randomBytes(32).toString("hex");
    return hexString;
}