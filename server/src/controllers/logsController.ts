import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Log } from "../models/Log.js";

export const getLogs = async (req: Request, res: Response) => {
    try {
        const userId = (req.user && (req.user as any)._id) || undefined;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userObjectId = new mongoose.Types.ObjectId(String(userId));

        const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "25"), 10) || 25, 1), 200);
        const status = String(req.query.status || "all").toUpperCase();
        const method = String(req.query.method || "all").toUpperCase();
        const search = String(req.query.search || "");

        const filter: any = { "metadata.user": userObjectId };

        if (status === "HIT") filter.cacheHit = true;
        else if (status === "MISS") filter.cacheHit = false;

        if (method !== "ALL") filter.httpMethod = method;

        if (search) filter["metadata.url"] = { $regex: search, $options: "i" };

        const [items, total] = await Promise.all([
            Log.find(filter)
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select({
                    timestamp: 1,
                    "metadata.url": 1,
                    httpMethod: 1,
                    cacheHit: 1,
                    roundTripTime: 1,
                    responseStatusCode: 1
                })
                .lean(),
            Log.countDocuments(filter)
        ]);

        const data = items.map(doc => ({
            timestamp: doc.timestamp,
            endpoint: (doc as any).metadata?.url,
            method: doc.httpMethod,
            cacheHit: doc.cacheHit,
            latencyMs: doc.roundTripTime,
            statusCode: doc.responseStatusCode
        }));

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch logs" });
    }
};


