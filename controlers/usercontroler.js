import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userRegister = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "User registration failed" });
    }
}

//User login
const userLogin = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password or email" });
        }
        
        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "User logged in successfully", user, token });
    } catch (error) {
        res.status(500).json({ message: "User login failed" });
    }
}

// User logout (optional - for server-side session management)
const userLogout = async (req, res) => {
    try {
        // In a JWT-based system, logout is typically handled client-side
        // by removing the token. However, you could implement a blacklist
        // or use refresh tokens for more security.
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed" });
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    const userId = req.userId;
    
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Failed to get user profile" });
    }
}

export default {
    userRegister,
    userLogin,
    userLogout,
    getUserProfile
};
