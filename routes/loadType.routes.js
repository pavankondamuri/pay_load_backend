import { Router } from "express";
import userMiddleware from "../middleware/user.meddleware.js";
import { 
    createLoadType, 
    getLoadTypesByCompany, 
    getLoadTypeById, 
    updateLoadType, 
    deleteLoadType 
} from "../controlers/loadType.controller.js";

const loadTypeRouter = Router();

// Create load type
loadTypeRouter.post("/create", userMiddleware, createLoadType);

// Get all load types for a company
loadTypeRouter.get("/company/:companyId", userMiddleware, getLoadTypesByCompany);

// Get single load type by ID
loadTypeRouter.get("/:loadTypeId", userMiddleware, getLoadTypeById);

// Update load type
loadTypeRouter.put("/:loadTypeId", userMiddleware, updateLoadType);

// Delete load type
loadTypeRouter.delete("/:loadTypeId", userMiddleware, deleteLoadType);

export default loadTypeRouter; 