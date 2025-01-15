import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const VerifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(400).json({ message: "Login is Required" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await UserModel.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ message: "Invalid Token: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({ message: "Invalid access token" });
    }
};

export default VerifyJWT;