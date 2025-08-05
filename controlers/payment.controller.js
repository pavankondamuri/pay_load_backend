import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body;
    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes: notes || {},
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, vendorName, accountHolderName, accountNumber, ifscCode, vehicleNumbers, loadTypeId } = req.body;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    // Generate expected signature
    const generated_signature = crypto.createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
    // Store payment in DB
    const payment = new Payment({
      razorpay_payment_id,
      razorpay_order_id,
      vendorName,
      amount,
      status: "Paid",
      date: new Date(),
      accountHolderName,
      accountNumber,
      ifscCode,
      vehicleNumbers,
      loadTypeId,
    });
    await payment.save();
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};