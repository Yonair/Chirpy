import { Request, Response } from "express";

export async function handlerReadiness(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}