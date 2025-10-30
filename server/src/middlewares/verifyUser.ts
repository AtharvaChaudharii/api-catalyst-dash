import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ success: false, message: "Authorization token missing" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        if (!decoded?.userId) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const user = await User.findById(decoded.userId).lean();
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};


