import { Request, Response } from "express";
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createUser, deleteUsers } from "../db/queries/users.js";
import { createChirp, getChirps, getChirpsById } from "../db/queries/chirps.js"; 

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
    userId: string;
  };

  const params: parameters = req.body;

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

  const chirp = await createChirp({ body: cleanedBody, userId: params.userId });

  respondWithJSON(res, 201, {
    ...chirp,
  })
}

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
  const email = req.body.email;
  const user = await createUser({ email });
  respondWithJSON(res, 201, user);

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