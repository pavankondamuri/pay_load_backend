import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    try {
        if (!token) {
            return res.status(401).json({ message: "Unauthorized || No token provided" });
        }
        // console.log(token,"token")
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded,"decoded")
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized || Invalid token" });
        }
        req.userId = decoded.id;
        next();
    } catch (e) {
        res.status(500).json({ message: "Internal server error", error: e.message });
    }
}

export default userMiddleware;