import { Request, Response } from "express";
import { config } from "../config.js";

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