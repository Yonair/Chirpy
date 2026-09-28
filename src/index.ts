import express from 'express';
import { handlerReadiness, handlerRequests, handlerReset } from './api/endpoint.js';
import { middlewareLogResponses, middlewareMetricsInc } from './api/middleware.js';

const app = express();
const port = 8080;

app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);

app.get("/admin/metrics", handlerRequests);

app.get("/admin/reset", handlerReset);

app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});