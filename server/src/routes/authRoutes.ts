import { Router } from "express";
import { login, register, getOneTimeApiKey } from "../controllers/authControllers.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/one-time-api-key", verifyUser, getOneTimeApiKey);

export default router;


