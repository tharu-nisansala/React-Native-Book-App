import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js"
import { connectDB } from "./lib/db.js";
import bookRoutes from "./routes/bookRoutes.js";
import cors from "cors";

const app = express();
const PORT=process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
    console.log(`Server is run on port ${PORT}`)
    connectDB();
})