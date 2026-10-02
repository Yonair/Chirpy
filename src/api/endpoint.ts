import { Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError, respondWithJSON } from "./json.js";

export async function handlerReadiness(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function handlerRequests(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}

export async function handlerReset(req: Request, res: Response): Promise<void> {
    config.fileserverHits = 0;
    res.send("Hits counter reset to 0");
}

export async function handlerPost(req: Request, res: Response): Promise<void> {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    respondWithError(res, 400, "Chirp is too long");
    return;
  }
  const bannedWords = ["kerfuffle", "sharbert", "fornax"];
  const cleanedBody: string = params.body.split(" ").map((word) => {
    if (bannedWords.includes(word.toLowerCase())) {
      return "****";
    }
    return word;
  }).join(" ");

  respondWithJSON(res, 200, {
    cleanedBody
  })
}