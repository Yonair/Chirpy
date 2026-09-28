import { Response, Request, NextFunction } from "express";
import { config } from "../config.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction):void {
    res.on("finish", () => {
        const logEntry = res.statusCode;
        if (logEntry < 200 || logEntry >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
        }
    });

    next();

}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
}
