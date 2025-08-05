import mongoose from "mongoose";

const loadTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Compound index to ensure unique load type names per company
loadTypeSchema.index({ name: 1, companyId: 1 }, { unique: true });

const LoadType = mongoose.model("LoadType", loadTypeSchema);
export default LoadType; 