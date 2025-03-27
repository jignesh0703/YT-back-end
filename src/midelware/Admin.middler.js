import jwt from 'jsonwebtoken'
import { AdminModel } from '../models/Admin.model.js';

const AdminDecord = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(400).json({ message: "Login is Required" });
        }

        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await AdminModel.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ message: "Invalid Token: User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(400).json({ message: "Invalid access token" });
    }
}

export default AdminDecord