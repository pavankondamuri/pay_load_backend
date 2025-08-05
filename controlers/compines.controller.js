import Company from "../models/company.model.js";
import User from "../models/user.js";

const createCompine = async (req, res) => {
    const userId = req.userId;
    const { companyName, ownerName, email, phoneNumber, description } = req.body;

    if (!companyName || !ownerName) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findById(userId); 

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const compine = await Company.create({ companyName, ownerName, email, phoneNumber, description });

        if (!compine) {
            return res.status(400).json({ message: "Company not created" });
        }

        user.company.push(compine._id); 
        await user.save();

        res.status(201).json({ message: "Company created successfully", compine });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// render compines as for the user
const getCompinesByUser = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.populate("company");
        const compines = user.company;
        res.status(200).json({ compines });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Get single company by ID
const getCompanyById = async (req, res) => {
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

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ company });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Update company
const updateCompany = async (req, res) => {
    const userId = req.userId;
    const { companyId } = req.params;
    const { companyName, ownerName, email, phoneNumber, description } = req.body;

    if (!companyName || !ownerName) {
        return res.status(400).json({ message: "Company name and owner name are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if company belongs to user
        if (!user.company.includes(companyId)) {
            return res.status(403).json({ message: "Access denied. Company not found in your account" });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { companyName, ownerName, email, phoneNumber, description },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// Delete company
const deleteCompany = async (req, res) => {
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

        const deletedCompany = await Company.findByIdAndDelete(companyId);
        if (!deletedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Remove company from user's company array
        user.company = user.company.filter(id => id.toString() !== companyId);
        await user.save();

        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export { 
    createCompine,
    getCompinesByUser,
    getCompanyById,
    updateCompany,
    deleteCompany
};
