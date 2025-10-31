import type { Request, Response } from "express";
import { User } from "../models/User.js";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await User.findById(userId).select({ email: 1, name: 1, company: 1 }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, company } = req.body ?? {};

        const update: Record<string, unknown> = {};
        if (typeof name === "string") update.name = name;
        if (typeof company === "string") update.company = company;

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ success: false, message: "Nothing to update" });
        }

        const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, select: { email: 1, name: 1, company: 1 } }).lean();
        if (!updated) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};


