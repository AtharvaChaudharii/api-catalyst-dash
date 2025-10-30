import type { UserSchema } from "../types.js";

export {};

declare global {
  namespace Express {
    interface Request {
      user: UserSchema
    }
  }
}
