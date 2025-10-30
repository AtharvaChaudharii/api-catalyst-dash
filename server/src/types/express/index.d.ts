import type { UserSchema } from "../types.ts";

export {};

declare global {
  namespace Express {
    interface Request {
      user: UserSchema
    }
  }
}
