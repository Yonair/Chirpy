import express from 'express';
import { handlerReadiness } from './api/endpoint.js';

const app = express();
const port = 8080;

app.get("/healthz", handlerReadiness);

app.use("/app", express.static("./src/app"));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});