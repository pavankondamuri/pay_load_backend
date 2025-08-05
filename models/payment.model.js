import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  razorpay_payment_id: { type: String, required: true },
  razorpay_order_id: { type: String, required: true },
  vendorName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Paid" },
  date: { type: Date, default: Date.now },
  accountHolderName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  vehicleNumbers: [{ type: String }],
  loadTypeId: { type: String },
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;