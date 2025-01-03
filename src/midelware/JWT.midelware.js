import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const VerifyJWT = async (req, res, next) => {
    try {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzZkNWNkZDA4MjBhMzI3ZjI5N2U2YjMiLCJlbWFpbCI6ImppZ3Nzc0BnbWFpbC5jb20iLCJpYXQiOjE3MzU5MTMyODAsImV4cCI6MTczNTk5OTY4MH0.hLx0svVxG9ywxNInWmUWJC2qKAJTvsqVem16wCarMZk'
        
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