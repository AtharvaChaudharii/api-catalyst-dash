import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = Router();

router.get("/profile", verifyUser, getProfile);
router.put("/profile", verifyUser, updateProfile);

export default router;


