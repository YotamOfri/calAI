require("dotenv").config();
import { PrismaClient } from "@prisma/client";
import express, { Express } from "express";
// import { categoriesRouter } from "./routes/categoriesRoutes";
import { aiRouter } from "./routes/aiRoutes";
const app: Express = express();
const port: Number = Number(process.env.PORT) || 3100;

app.use(express.json());

// app.use("/categories", categoriesRouter);
app.use("/ai", aiRouter);
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
