import mongoose, { Schema } from "mongoose";
import type { LogSchema } from "../types/types.js";

const logSchema = new Schema<LogSchema>(
    {
        timestamp: Date,
        metadata: {
            url: String,
            user: {
                type: Schema.Types.ObjectId,
                ref:"User"
            }
        },
        cacheHit: Boolean,
        roundTripTime: Number,
        responseStatusCode: Number,
        httpMethod: String,
    },
    {
        timeseries: {
            timeField: "timestamp",
            metaField: "metadata",
            granularity: "seconds"
        }
    }
)

export const Log = mongoose.model<LogSchema>("Log", logSchema)