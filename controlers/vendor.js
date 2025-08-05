import User from "../models/user.js";
import Vendor from "../models/vendor.js";

//vendor register 
const vendorCreater = async (req, res) => {
    const userId = req.userId
    const { name, accountHolderName, accountNumber, ifscCode, phoneNumber, vechicleNumber } = req.body;
    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const vendor = await Vendor.create({ name, accountHolderName, accountNumber, ifscCode, phoneNumber, vechicleNumber });
        user.vendorId.push(vendor._id);
        await user.save();
        res.status(201).json({ vendor });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// get all vendors by the user
const getallVendors = async (req, res) => {
    const userId = req.userId
    try {
        const user = await User.findById(userId);
        if (!user){
            res.status(404).json({message:"user not found"})
        }
        // Populate the vendorId field to get the actual vendor documents
        await user.populate("vendorId");
        const data = user.vendorId;
        if (!data || data.length == 0){
            return res.status(400).json({message:"no vendors found"})
        }
        res.status(200).json({vendors:data})

    } catch (error) {
        req.status(500).json({ message: "internal error" })
    }
}

// Get single vendor by ID
const getVendorById = async (req, res) => {
    const userId = req.userId;
    const { vendorId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if vendor belongs to user
        if (!user.vendorId.includes(vendorId)) {
            return res.status(403).json({ message: "Access denied. Vendor not found in your account" });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ vendor });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Update vendor
const updateVendor = async (req, res) => {
    const userId = req.userId;
    const { vendorId } = req.params;
    const { name, accountHolderName, accountNumber, ifscCode, phoneNumber, vechicleNumber } = req.body;

    if (!name || !accountHolderName || !accountNumber || !ifscCode || !phoneNumber) {
        return res.status(400).json({ message: "All required fields must be provided" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if vendor belongs to user
        if (!user.vendorId.includes(vendorId)) {
            return res.status(403).json({ message: "Access denied. Vendor not found in your account" });
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(
            vendorId,
            { name, accountHolderName, accountNumber, ifscCode, phoneNumber, vechicleNumber },
            { new: true, runValidators: true }
        );

        if (!updatedVendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ message: "Vendor updated successfully", vendor: updatedVendor });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Delete vendor
const deleteVendor = async (req, res) => {
    const userId = req.userId;
    const { vendorId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if vendor belongs to user
        if (!user.vendorId.includes(vendorId)) {
            return res.status(403).json({ message: "Access denied. Vendor not found in your account" });
        }

        const deletedVendor = await Vendor.findByIdAndDelete(vendorId);
        if (!deletedVendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Remove vendor from user's vendorId array
        user.vendorId = user.vendorId.filter(id => id.toString() !== vendorId);
        await user.save();

        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export { 
    vendorCreater, 
    getallVendors, 
    getVendorById, 
    updateVendor, 
    deleteVendor 
};