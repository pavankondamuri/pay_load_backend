import express from "express";
import { createOrder, verifyPayment, getPaymentHistory } from "../controlers/payment.controller.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);

export default router;