import {Router} from "express";
import userRegister from "../controlers/usercontroler.js";
import userMiddleware from "../middleware/user.meddleware.js";

const userRouter=Router();

// Public routes
userRouter.post("/register",userRegister.userRegister);
userRouter.post("/login",userRegister.userLogin);

// Protected routes
userRouter.post("/logout", userMiddleware, userRegister.userLogout);
userRouter.get("/profile", userMiddleware, userRegister.getUserProfile);

export default userRouter;