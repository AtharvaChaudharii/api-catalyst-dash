import mongoose, { Schema } from "mongoose"
import type { UserSchema } from "../types/types.js"

const userSchema = new Schema<UserSchema>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    api_key: {
        type: String,
        required: true,
        unique: true
    },
    config : {
        ttl : {
            type: Number,
            default : 3600,
        },
        autoEviction : {
            type: Boolean,
            default: false,
        }
    }
}, { timestamps: true })

export const User = mongoose.model<UserSchema>("User", userSchema)