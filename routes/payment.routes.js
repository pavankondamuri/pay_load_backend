import express from "express";
import { createOrder, verifyPayment, getPaymentHistory, getPaymentStats } from "../controlers/payment.controller.js";
import authMiddleware  from "../middleware/user.meddleware.js";
const router = express.Router();

router.post("/create-order",authMiddleware,createOrder);
router.post("/verify",authMiddleware, verifyPayment);
router.get("/history",authMiddleware, getPaymentHistory);
router.get("/stats",authMiddleware, getPaymentStats);

export default router;