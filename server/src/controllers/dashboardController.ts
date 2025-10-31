import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Log } from "../models/Log.js";

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const userId = (req.user && (req.user as any)._id) || undefined;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userObjectId = new mongoose.Types.ObjectId(String(userId));

        const [totalRequests, cacheHitCount] = await Promise.all([
            Log.countDocuments({ "metadata.user": userObjectId }),
            Log.countDocuments({ "metadata.user": userObjectId, cacheHit: true })
        ]);

        const cacheHitRatio = totalRequests > 0 ? (cacheHitCount / totalRequests) * 100 : 0;

        const avgAgg = await Log.aggregate<{
            _id: null;
            avgCache: number;
            avgNonCache: number;
        }>([
            { $match: { "metadata.user": userObjectId } },
            {
                $group: {
                    _id: null,
                    avgCache: {
                        $avg: {
                            $cond: [{ $eq: ["$cacheHit", true] }, "$roundTripTime", undefined]
                        }
                    },
                    avgNonCache: {
                        $avg: {
                            $cond: [{ $eq: ["$cacheHit", false] }, "$roundTripTime", undefined]
                        }
                    }
                }
            }
        ]);

        const avgCacheMs = avgAgg?.[0]?.avgCache ?? 0;
        const avgNonCacheMs = avgAgg?.[0]?.avgNonCache ?? 0;
        const rawSaved = avgNonCacheMs - avgCacheMs;
        const averageLatencySavedMs = Number.isFinite(rawSaved) && rawSaved > 0 ? rawSaved : 0;

        const apiCallsPrevented = cacheHitCount;

        const now = new Date();
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const seriesAgg = await Log.aggregate<{
            _id: Date;
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
                        $dateTrunc: { date: "$timestamp", unit: "hour", binSize: 3 }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const buckets: { bucketStart: string; count: number }[] = [];
        const bucketSizeMs = 3 * 60 * 60 * 1000;
        const alignedEnd = new Date(Math.floor(now.getTime() / bucketSizeMs) * bucketSizeMs);
        const alignedStart = new Date(alignedEnd.getTime() - 7 * bucketSizeMs);

        const seriesMap = new Map<number, number>();
        for (const doc of seriesAgg) {
            const t = new Date(doc._id).getTime();
            seriesMap.set(t, doc.count);
        }

        for (let i = 0; i < 8; i++) {
            const ts = alignedStart.getTime() + i * bucketSizeMs;
            buckets.push({ bucketStart: new Date(ts).toISOString(), count: seriesMap.get(ts) ?? 0 });
        }

        return res.status(200).json({
            success: true,
            data: {
                totalRequests,
                cacheHitRatio,
                averageLatencySavedMs,
                apiCallsPrevented,
                series: buckets
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
};


