import { Response, Request, NextFunction } from "express";
import { config } from "../config.js";
import { NotFoundError, BadRequestError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithError } from "./json.js";


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

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction,) {
   let statusCode = 500;
   let message = "Something went wrong on our end";

    if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UserNotAuthenticatedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof UserForbiddenError) {
    statusCode = 403;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.log(err.message);
  }

  respondWithError(res, statusCode, message);
}
