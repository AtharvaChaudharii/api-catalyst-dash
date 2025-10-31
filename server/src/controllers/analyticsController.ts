import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Log } from "../models/Log.js";

export const getHitMissSeries = async (req: Request, res: Response) => {
    try {
        const userId = (req.user && (req.user as any)._id) || undefined;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userObjectId = new mongoose.Types.ObjectId(String(userId));
        const now = new Date();
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const bucketSizeMs = 3 * 60 * 60 * 1000;

        const seriesAgg = await Log.aggregate<{
            _id: { bucket: Date; cacheHit: boolean };
            count: number;
        }>([
            {
                $match: {
                    "metadata.user": userObjectId,
                    timestamp: { $gte: start, $lte: now }
                }
            },
            {
                $group: {
                    _id: {
                        bucket: { $dateTrunc: { date: "$timestamp", unit: "hour", binSize: 3 } },
                        cacheHit: "$cacheHit"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.bucket": 1 } }
        ]);

        const alignedEnd = new Date(Math.floor(now.getTime() / bucketSizeMs) * bucketSizeMs);
        const alignedStart = new Date(alignedEnd.getTime() - 7 * bucketSizeMs);

        const hitsMap = new Map<number, number>();
        const missesMap = new Map<number, number>();
        for (const doc of seriesAgg) {
            const t = new Date(doc._id.bucket).getTime();
            if (doc._id.cacheHit === true) hitsMap.set(t, (hitsMap.get(t) || 0) + doc.count);
            else missesMap.set(t, (missesMap.get(t) || 0) + doc.count);
        }

        const buckets: { bucketStart: string; hits: number; misses: number }[] = [];
        for (let i = 0; i < 8; i++) {
            const ts = alignedStart.getTime() + i * bucketSizeMs;
            buckets.push({
                bucketStart: new Date(ts).toISOString(),
                hits: hitsMap.get(ts) ?? 0,
                misses: missesMap.get(ts) ?? 0
            });
        }

        return res.status(200).json({ success: true, data: buckets });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch hit/miss series" });
    }
};

export const getTopEndpoints = async (req: Request, res: Response) => {
    try {
        const userId = (req.user && (req.user as any)._id) || undefined;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userObjectId = new mongoose.Types.ObjectId(String(userId));

        const agg = await Log.aggregate<{
            _id: string;
            requests: number;
            cacheHit: number;
        }>([
            { $match: { "metadata.user": userObjectId } },
            {
                $group: {
                    _id: "$metadata.url",
                    requests: { $sum: 1 },
                    cacheHit: { $sum: { $cond: [{ $eq: ["$cacheHit", true] }, 1, 0] } }
                }
            },
            { $sort: { requests: -1 } }
        ]);

        const data = agg.map(row => ({
            endpoint: row._id,
            requests: row.requests,
            cacheHitRatio: row.requests > 0 ? (row.cacheHit / row.requests) * 100 : 0
        }));

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch top endpoints" });
    }
};

export const getLatencySavedByEndpoint = async (req: Request, res: Response) => {
    try {
        const userId = (req.user && (req.user as any)._id) || undefined;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userObjectId = new mongoose.Types.ObjectId(String(userId));

        const agg = await Log.aggregate<{
            _id: string;
            avgCache: number;
            avgNonCache: number;
        }>([
            { $match: { "metadata.user": userObjectId } },
            {
                $group: {
                    _id: "$metadata.url",
                    avgCache: { $avg: { $cond: [{ $eq: ["$cacheHit", true] }, "$roundTripTime", undefined] } },
                    avgNonCache: { $avg: { $cond: [{ $eq: ["$cacheHit", false] }, "$roundTripTime", undefined] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const data = agg.map(row => {
            const saved = (row.avgNonCache ?? 0) - (row.avgCache ?? 0);
            const savedClamped = Number.isFinite(saved) && saved > 0 ? saved : 0;
            return { endpoint: row._id, saved: savedClamped };
        });

        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch latency saved by endpoint" });
    }
};


