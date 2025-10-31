import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import { getHitMissSeries, getTopEndpoints, getLatencySavedByEndpoint } from "../controllers/analyticsController.js";

const router = Router();

router.get("/hit-miss-series", verifyUser, getHitMissSeries);
router.get("/top-endpoints", verifyUser, getTopEndpoints);
router.get("/latency-saved", verifyUser, getLatencySavedByEndpoint);

export default router;


