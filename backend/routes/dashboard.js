import express from "express";
import { getAdminDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

// Route to fetch dashboard data
router.get("/", getAdminDashboard);

export default router;
