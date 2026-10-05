import express from 'express';
import { handlerReadiness, handlerRequests, handlerReset, handlerPost, handlerCreateUser, handlerGetChirps, handlerGetChirpsById } from './api/endpoint.js';
import { middlewareLogResponses, middlewareMetricsInc, errorHandler } from './api/middleware.js';
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
const app = express();
const port = config.api.port;

app.use(express.json());
app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerRequests);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpId", handlerGetChirpsById);
app.post("/admin/reset", handlerReset);
app.post("/api/users", handlerCreateUser);
app.post("/api/chirps", handlerPost);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});