import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const VerifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            return res.status(400).json({ message: "Unauthorized request" })
        }

        const decorded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await UserModel.findById(decorded?._id).select("-password -refreshToken")

        if(!user){
            return res.status(400).json({message:"Invalid Token"})
        }

        req.user = user;
        next()

    } catch (error) {
        return res.status(400).json({ message: "Invalid access token" })
    }
}

export default VerifyJWT