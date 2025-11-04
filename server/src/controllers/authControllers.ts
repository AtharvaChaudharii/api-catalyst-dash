import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/User.js";
import { encrypt, decrypt } from "../utils/crypto.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
}

const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER as string;
if (!PASSWORD_PEPPER) {
    throw new Error("PASSWORD_PEPPER is not set in environment variables");
}

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password required" });
        }

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const passwordHash = await bcrypt.hash(password + PASSWORD_PEPPER, BCRYPT_ROUNDS);

        const apiKeyPlain = crypto.randomBytes(32).toString("hex");
        const apiKeyHash = await bcrypt.hash(apiKeyPlain, BCRYPT_ROUNDS);
        const apiKeyEncryptedOnce = encrypt(apiKeyPlain);

        const created = await User.create({
            email,
            password_hash: passwordHash,
            api_key_hash: apiKeyHash,
            api_key_encrypted_once: apiKeyEncryptedOnce,
            api_key_retrieved: false,
        });

        const token = jwt.sign({ userId: created._id.toString(), email: created.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({ success: true, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to register user" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "email and password are required" });
        }

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password + PASSWORD_PEPPER, user.password_hash);
        if (!ok) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({ success: true, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to login" });
    }
};

export const getOneTimeApiKey = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        })
        if (user.api_key_retrieved || !user.api_key_encrypted_once) return res.status(404).json({
            success: false,
            message: "Api key already retrieved"
        })
        const apiKeyPlain = decrypt(user.api_key_encrypted_once);
        user.api_key_retrieved = true;
        user.api_key_encrypted_once = "";
        await user.save();
        return res.status(200).json({ success: true, apiKey: apiKeyPlain });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Failed to fetch API key" });
    }
};

