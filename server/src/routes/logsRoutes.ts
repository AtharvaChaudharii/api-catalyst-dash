import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { getLogs } from "../controllers/logsController.js";

const router = Router();

router.get("/", verifyUser, getLogs);

export default router;


