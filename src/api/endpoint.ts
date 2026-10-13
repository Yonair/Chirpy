import { Request, Response } from "express";
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";
import { createUser, deleteUsers, getUserByEmail, updateUser } from "../db/queries/users.js";
import { createChirp, getChirps, getChirpsById, removeChirp } from "../db/queries/chirps.js"; 
import { hashPassword, checkPasswordHash, makeJWT, getBearerToken, validateJWT, makeRefreshToken } from "./auth.js";
import { NewUser } from "../db/schema.js";
import { createRefreshToken, getUserFromRefreshToken } from "../db/queries/refresh.js";
import { revokeRefreshToken } from "../db/queries/revoke.js"





export async function handlerReadiness(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function handlerRequests(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>`);
}

export async function handlerReset(req: Request, res: Response): Promise<void> {
  
  if (!config.api.platform || config.api.platform != "dev") {
    respondWithJSON(res, 403, { error: "Forbidden"});
    return;
  }
  else {
    await deleteUsers();
  }; 
  config.api.fileserverHits = 0;
    res.send("Hits counter reset to 0");
}

export async function handlerPost(req: Request, res: Response): Promise<void> {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;
  

  const authenticated = getBearerToken(req);
  if (!authenticated) {
    respondWithJSON(res, 401, { error: "Unauthorized" });
    return;
  }

  const userId = validateJWT(authenticated, config.api.secret);

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long");
  }

  const bannedWords = ["kerfuffle", "sharbert", "fornax"];
  const cleanedBody: string = params.body.split(" ").map((word) => {
    if (bannedWords.includes(word.toLowerCase())) {
      return "****";
    }
    return word;
  }).join(" ");

  const chirp = await createChirp({ body: cleanedBody, userId });

  respondWithJSON(res, 201, {
    ...chirp,
  })
}

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
  type UserResponse = Omit<NewUser, "hashedPassword">;

  
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const hashedPassword = await hashPassword(password);
  const user = await createUser({ email, hashedPassword });
  const userResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse;
  respondWithJSON(res, 201, userResponse);

}

export async function handlerGetChirps(req: Request, res: Response): Promise<void> {
  const chirps = await getChirps();
  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirpsById(req: Request, res: Response): Promise<void> {
  const { chirpId } = req.params;
  if (typeof chirpId !== "string") {
    respondWithJSON(res, 400, { error: "Invalid chirp ID" });
    return;
  }
  const chirp = await getChirpsById(chirpId);
  if (!chirp) {
    respondWithJSON(res, 404, { error: "Chirp not found" });
    return;
  }
  respondWithJSON(res, 200, chirp);
}

export async function handlerLogin(req: Request, res: Response): Promise<void> {
  const userVerified = await getUserByEmail(req.body.email);
  type LoginParams = {
    email: string;
    password: string;
  };
  const params: LoginParams = req.body;

  const ONE_HOUR = 3600;
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

  if (!params.email || !params.password) {
    respondWithJSON(res, 400, { error: "Email and password are required" });
    return;
  }

  if (!userVerified) {
    respondWithJSON(res, 401, { error: "Invalid email or password" });
    return;
  }
  const passwordVerified = await checkPasswordHash(req.body.password, userVerified.hashedPassword);
  if (!passwordVerified) {
    respondWithJSON(res, 401, { error: "Invalid email or password" });
    return;
  }

  const refreshToken = makeRefreshToken();

  await createRefreshToken({
    token: refreshToken,
    userId: userVerified.id,
    expiresAt: new Date(Date.now() + SIXTY_DAYS_MS),
    revokedAt: null,
  })

  const accessToken = makeJWT(userVerified.id, ONE_HOUR, config.api.secret);

  respondWithJSON(res, 200, { 
    "id": userVerified.id,
    "createdAt": userVerified.createdAt,
    "updatedAt": userVerified.updatedAt,
    "email": userVerified.email,
    "token": accessToken,
    "refreshToken": refreshToken,
   });
}

export async function handlerRefreshTokens(req: Request, res: Response): Promise<void> {
    const ONE_HOUR = 3600;
  
    const bearerToken = getBearerToken(req);
    const row = await getUserFromRefreshToken(bearerToken);
    if (!row || row.refresh_tokens.revokedAt !== null || row.refresh_tokens.expiresAt < new Date()) {
      respondWithJSON(res, 401, { error: "Invalid token"})
      return;
    }
    
    const accessToken = makeJWT(row.users.id, ONE_HOUR, config.api.secret)
    respondWithJSON(res, 200, {
      "token": accessToken
    });
}

export async function handlerRevoke(req: Request, res: Response): Promise<void> {
  const token = getBearerToken(req);

  await revokeRefreshToken(token);

  res.status(204).send();
}

export async function handlerUpdateUser(req: Request, res: Response): Promise<void> {
  type UserResponse = Omit<NewUser, "hashedPassword">;
  
    const authenticated = getBearerToken(req);
    const userId = validateJWT(authenticated, config.api.secret);
  

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const hashedPassword = await hashPassword(password);

  const user = await updateUser(userId, email, hashedPassword);
  const userResponse = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse;

  respondWithJSON(res, 200, userResponse);
}

export async function handlerDeleteChirp(req: Request, res: Response): Promise<void> {
  const { chirpId } = req.params;
  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID" );
  }

  const authenticated = getBearerToken(req);
  const userId = validateJWT(authenticated, config.api.secret);
  
  const chirp = await getChirpsById(chirpId);
   if (!chirp) {
    throw new NotFoundError("Chirp not found" );
  }
  if (chirp.userId !== userId) {
    throw new UserForbiddenError("Unauthorized request")
  }

  await removeChirp(chirpId);

  res.status(204).send();
  
}