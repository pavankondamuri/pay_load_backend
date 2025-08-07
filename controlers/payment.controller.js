import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
import User from "../models/user.js";
import Company from "../models/company.model.js";
import Vendor from "../models/vendor.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  const userId = req.userId;
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
  const userId = req.userId;
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      amount, 
      vendorName, 
      vendorId,
      companyName,
      companyId,
      accountHolderName, 
      accountNumber, 
      ifscCode, 
      vehicleNumbers, 
      loadTypeId,
      loadTypeName 
    } = req.body;
    
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
      vendorId,
      companyName,
      companyId,
      amount,
      status: "Paid",
      date: new Date(),
      accountHolderName,
      accountNumber,
      ifscCode,
      vehicleNumbers,
      loadTypeId,
      loadTypeName,
      userId // Get from auth middleware
    });
    
    await payment.save();
    
    // Update related models with payment information
    try {
      // Update vendor with payment ID
      if (vendorId) {
        await Vendor.findByIdAndUpdate(vendorId, {
          $push: { paymentHistory: razorpay_payment_id }
        });
      }
      
      // Update company with payment ID
      if (companyId) {
        await Company.findByIdAndUpdate(companyId, {
          $push: { paymentHistory: razorpay_payment_id }
        });
      }
      
      // Update user with payment ID (if user is authenticated)
      if (userId) {
        // console.log(userId,"user id");
        await User.findByIdAndUpdate(userId, {
          $push: { paymentHistory: razorpay_payment_id }
        });
      }
    } catch (updateError) {
      console.error("Error updating related models:", updateError);
      // Don't fail the payment if model updates fail
    }
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { 
      vendorName, 
      companyName, 
      status, 
      dateFrom, 
      dateTo, 
      amountMin, 
      amountMax,
      vehicleNumber,
      loadTypeId,
      page = 1,
      limit = 20
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (vendorName) {
      filter.vendorName = { $regex: vendorName, $options: 'i' };
    }
    
    if (companyName) {
      filter.companyName = { $regex: companyName, $options: 'i' };
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    }
    
    if (amountMin || amountMax) {
      filter.amount = {};
      if (amountMin) {
        filter.amount.$gte = Number(amountMin);
      }
      if (amountMax) {
        filter.amount.$lte = Number(amountMax);
      }
    }
    
    if (vehicleNumber) {
      filter.vehicleNumbers = { $regex: vehicleNumber, $options: 'i' };
    }
    
    if (loadTypeId) {
      filter.loadTypeId = loadTypeId;
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get total count for pagination
    const totalCount = await Payment.countDocuments(filter);
    
    // Get payments with filters and pagination
    const payments = await Payment.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    res.json({
      payments,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasNextPage: skip + payments.length < totalCount,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const { companyId, vendorId, dateFrom, dateTo } = req.query;
    
    const filter = {};
    
    if (companyId) {
      filter.companyId = companyId;
    }
    
    if (vendorId) {
      filter.vendorId = vendorId;
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    }
    
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" }
        }
      }
    ]);
    
    const statusStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      stats: stats[0] || {
        totalAmount: 0,
        totalPayments: 0,
        avgAmount: 0,
        minAmount: 0,
        maxAmount: 0
      },
      statusStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};