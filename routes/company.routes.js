import { Router } from "express";
import userMiddleware from "../middleware/user.meddleware.js";
import { createCompine, getCompinesByUser, getCompanyById, updateCompany, deleteCompany } from "../controlers/compines.controller.js";

const companyRouter = Router();

// Create company
companyRouter.post("/create", userMiddleware, createCompine);

// Get all companies for user
companyRouter.get("/get", userMiddleware, getCompinesByUser);

// Get single company by ID
companyRouter.get("/:companyId", userMiddleware, getCompanyById);

// Update company
companyRouter.put("/:companyId", userMiddleware, updateCompany);

// Delete company
companyRouter.delete("/:companyId", userMiddleware, deleteCompany);

export default companyRouter;
