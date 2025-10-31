import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const router = Router();

router.get("/summary", verifyUser, getDashboardSummary);

export default router;


