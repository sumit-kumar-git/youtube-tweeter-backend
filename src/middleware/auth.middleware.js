import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../model/user.model.js"
import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"

export const auth = asyncHandler(async (req, _, next) => {

    const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!Token) {
        throw new ApiError(404, "unauthorized request")
    }
    
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(409, "Invalid token")
        }
   try {
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(404, "Invalid token")
        }

        req.user = user

        // req.user = {
        //     _id:decodedToken._id,
        //     email:decodedToken.email,
        //     username:decodedToken.username
        // }

        next()

    } catch (error) {
        throw new ApiError(403, "Token not found")
    }
})