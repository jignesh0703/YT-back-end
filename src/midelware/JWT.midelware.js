import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const VerifyJWT = async (req, res, next) => {
    try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzZkNGFhZTU0MmMzMWUzMzQ2MWU4NjYiLCJlbWFpbCI6ImppZ3NAZ21haWwuY29tIiwiaWF0IjoxNzM1MzA0NDU3LCJleHAiOjE3MzUzOTA4NTd9.EigDSELD3qi3QJRJSQvQ6nzLQB9WOZZqwnheaZiJwUs"

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
        console.log(error)
        return res.status(400).json({ message: "Invalid access token" })
    }
}

export default VerifyJWT