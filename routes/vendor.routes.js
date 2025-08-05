import express from "express";
import { getallVendors, vendorCreater, getVendorById, updateVendor, deleteVendor } from "../controlers/vendor.js";
import userMiddleware from "../middleware/user.meddleware.js";

const vendorRouter = express.Router();

// Create vendor
vendorRouter.post("/create", userMiddleware, vendorCreater);

// Get all vendors for user
vendorRouter.get("/get", userMiddleware, getallVendors);

// Get single vendor by ID
vendorRouter.get("/:vendorId", userMiddleware, getVendorById);

// Update vendor
vendorRouter.put("/:vendorId", userMiddleware, updateVendor);

// Delete vendor
vendorRouter.delete("/:vendorId", userMiddleware, deleteVendor);

export default vendorRouter;