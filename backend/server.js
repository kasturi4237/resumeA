
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRoute from "./routes/analyze.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRoute);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});