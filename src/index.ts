import express from 'express';
import { handlerReadiness, handlerRequests, handlerReset, handlerPost } from './api/endpoint.js';
import { middlewareLogResponses, middlewareMetricsInc } from './api/middleware.js';

const app = express();
const port = 8080;

app.use(express.json());
app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerRequests);
app.post("/admin/reset", handlerReset);

app.post("/api/validate_chirp", handlerPost);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});