import { User } from "../model/user.model.js"
import { ApiError } from "./ApiError.js"

 const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        console.log(`access token ${accessToken}`);
        console.log(`refresh token ${refreshToken}`);

        if (!accessToken || !refreshToken) {
            throw new ApiError(401, "token not generated")
        }

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }



    } catch (err) {
        throw new ApiError(501, err.message || "something went wrong while generating token")
    }
}

export {generateAccessAndRefreshToken}