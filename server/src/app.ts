import express from "express"
import type { Request, Response } from "express";
import cors from "cors"
import authRoutes from "./routes/authRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import logsRoutes from "./routes/logsRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express();
app.use(cors({
    origin: "*"
}))
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Api Catalyst Dashboard!",
    })
});


export { app };