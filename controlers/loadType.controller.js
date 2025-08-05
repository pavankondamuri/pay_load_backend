import LoadType from "../models/loadType.model.js";
import User from "../models/user.js";
import Company from "../models/company.model.js";

// Create load type
const createLoadType = async (req, res) => {
    const userId = req.userId;
    const { name, companyId, description } = req.body;

    if (!name || !companyId) {
        return res.status(400).json({ message: "Name and company ID are required" });
    }

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if company belongs to user
        if (!user.company.includes(companyId)) {
            return res.status(403).json({ message: "Access denied. Company not found in your account" });
        }

        // Check if load type name already exists for this company
        const existingLoadType = await LoadType.findOne({ 
            name: name.trim(), 
            companyId: companyId 
        });

        if (existingLoadType) {
            return res.status(400).json({ message: "Load type with this name already exists for this company" });
        }

        const loadType = await LoadType.create({
            name: name.trim(),
            companyId,
            userId,
            description: description || ""
        });

        res.status(201).json({ message: "Load type created successfully", loadType });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Get all load types for a company
const getLoadTypesByCompany = async (req, res) => {
    const userId = req.userId;
    const { companyId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if company belongs to user
        if (!user.company.includes(companyId)) {
            return res.status(403).json({ message: "Access denied. Company not found in your account" });
        }

        const loadTypes = await LoadType.find({ 
            companyId: companyId, 
            isActive: true 
        }).sort({ name: 1 });

        res.status(200).json({ loadTypes });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Get single load type by ID
const getLoadTypeById = async (req, res) => {
    const userId = req.userId;
    const { loadTypeId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const loadType = await LoadType.findById(loadTypeId);
        if (!loadType) {
            return res.status(404).json({ message: "Load type not found" });
        }

        // Check if company belongs to user
        if (!user.company.includes(loadType.companyId.toString())) {
            return res.status(403).json({ message: "Access denied. Load type not found in your account" });
        }

        res.status(200).json({ loadType });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Update load type
const updateLoadType = async (req, res) => {
    const userId = req.userId;
    const { loadTypeId } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const loadType = await LoadType.findById(loadTypeId);
        if (!loadType) {
            return res.status(404).json({ message: "Load type not found" });
        }

        // Check if company belongs to user
        if (!user.company.includes(loadType.companyId.toString())) {
            return res.status(403).json({ message: "Access denied. Load type not found in your account" });
        }

        // Check if new name already exists for this company (excluding current load type)
        const existingLoadType = await LoadType.findOne({ 
            name: name.trim(), 
            companyId: loadType.companyId,
            _id: { $ne: loadTypeId }
        });

        if (existingLoadType) {
            return res.status(400).json({ message: "Load type with this name already exists for this company" });
        }

        const updatedLoadType = await LoadType.findByIdAndUpdate(
            loadTypeId,
            { name: name.trim(), description: description || "" },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Load type updated successfully", loadType: updatedLoadType });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Delete load type (soft delete by setting isActive to false)
const deleteLoadType = async (req, res) => {
    const userId = req.userId;
    const { loadTypeId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const loadType = await LoadType.findById(loadTypeId);
        if (!loadType) {
            return res.status(404).json({ message: "Load type not found" });
        }

        // Check if company belongs to user
        if (!user.company.includes(loadType.companyId.toString())) {
            return res.status(403).json({ message: "Access denied. Load type not found in your account" });
        }

        // Soft delete by setting isActive to false
        loadType.isActive = false;
        await loadType.save();

        res.status(200).json({ message: "Load type deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export {
    createLoadType,
    getLoadTypesByCompany,
    getLoadTypeById,
    updateLoadType,
    deleteLoadType
}; 