import mongoose, { Schema } from "mongoose"
import type { UserSchema } from "../types/types.js"

const userSchema = new Schema<UserSchema>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true,
    },
    api_key_hash: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    api_key_encrypted_once: {
        type: String,
        required: false,
    },
    api_key_retrieved: {
        type: Boolean,
        default: false,
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