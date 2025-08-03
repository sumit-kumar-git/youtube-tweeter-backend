import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../model/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import mongoose from "mongoose"
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { generateAccessAndRefreshToken } from "../utils/generateToken.js"
import jwt from "jsonwebtoken";



const registerUser = asyncHandler(async (req, res) => {

    console.log("hello");


    //   return res.status(200).json({message:"ok"})

    // get user details by req.body
    // validate that details - not empty
    // check if user is already exist
    // check for files like images(avatar,coverimage docoments etc.) by req.files
    // upload them to clodinary
    // create user in db by .create({})
    // finally send response after removing passwordand refreshToken from response by .select

    const { email, fullName, password, username } = req.body


    if (!email || !fullName || !username || !password) {
        throw new ApiError(400, "all fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(400, "user with this email or username is allready exist")
    }

    if (!req.files || !req.files.avatar || !req.files.coverImage) {
        throw new ApiError(404, "file not found")
    }

    const avatarPath = req.files?.avatar[0]?.path
    const coverImagePath = req.files?.coverImage[0]?.path

    if (!avatarPath || !coverImagePath) {
        throw new ApiError(403, "avatar or coverImage file not find")
    }

    const avatar = await uploadOnCloudinary(avatarPath)
    const coverImage = await uploadOnCloudinary(coverImagePath)

    if (!avatar.url || !coverImage.url) {
        throw new ApiError(403, "avatar or coverImage is not found")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username,
        avatar: {
            url: avatar.secure_url,
            public_id: avatar.public_id
        },
        coverImage: {
            url: coverImage.secure_url,
            public_id: coverImage.public_id
        }
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registring the user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "user registerd successfully"
            )
        )


})


const loginUser = asyncHandler(async (req, res) => {
    // get username or email and password from user by req.body
    // validate - empty
    // find user 
    // if user exist then validate password
    // generate accessToken and refreshToken for user
    // add accessToken and refreshToken in cookie
    // finally send response


    const { username, email, password } = req.body



    if (!username && !email) {
        throw new ApiError(403, "username or email is required for login")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    //  const user = await User.findOne(username ? {username} : {email}).select("+password")

    if (!user) {
        throw new ApiError(404, "unauthorized request")
    }

    if (!password) {
        throw new ApiError(401, "password is required")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(409, "Inavalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    if (!loggedinUser) {
        throw new ApiError(500, "something went wrong while login")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinUser, accessToken, refreshToken
                },
                "user loggedin successfully"
            )
        )
})

console.log("before logout calling")


const logoutUser = asyncHandler(async (req, res) => {


    //     // get userID from req.user 
    //     // remove refreshToken by findByIdAndUpdate() method
    //     // clear cookie while sending the response 

    const userID = req.user?._id || ""

    if (!userID) {
        throw new ApiError(404, "userID is not found")
    }

    const updatedUser = await User.findByIdAndUpdate(
        userID,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
   

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "user loggedout successfully"
            )
        )




})

const refreshAccessToken = asyncHandler(async (req, res) => {

    // get Incoming refreshToken from user by cookies or body
    // verify incoming refreshToken and get decoded toekn 
    // find user by decoded token 
    // now check user.refreshToken and Incoming token is equal  or not
    // if equal then generate Access and Refresh Token
    // finally send in cookie in response

    const incomingRefershToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefershToken) {
        throw new ApiError(404, "unauthorized request")
    }

    try {
        const decodedToken = await jwt.verify(incomingRefershToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(403, "Invalid refresh token")
        }

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(403, "Invalid refreshToken");

        }
        if (incomingRefershToken.toString() !== user?.refreshToken.toString()) {
            throw new ApiError(404, "refresh token is Expired");

        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access Token is Refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh Token");

    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    // get old password , new password , confirm new password(optional) by req.body
    // verify new and confirm new if you take confirm password
    // find user - req.user._id
    // verify old password - user.isPasswordCorrect
    // if password correct - user.password = newPassword
    // user.save
    // finally messgage in response password change successfully

    const { oldPassword, newPassword, confirmNewPassword } = req.body

    if (newPassword.toString() !== confirmNewPassword.toString()) {
        throw new ApiError(400, "new password and confirm new password is different")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "unauthorized request")

    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password is incoorect")

    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed Successfully")
        )

})


const getCurrentUser = asyncHandler(async (req, res) => {

    // directly return req.user

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User fetched Successfully"
            )
        )

})

const updateUserDetails = asyncHandler(async (req, res) => {

    // get details which to be update(optionally)
    // update by findBYIdAndUpdate method
    // return updated user in response

    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new ApiError(400, "all fields are empty");

    }

    const options = {}
    if (fullName) {
        options.fullName = fullName;
    }
    if (email) {
        options.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        options,
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: updatedUser },
                "updated user profile successfully"
            )
        )

})

const updateAvatar = asyncHandler(async (req, res) => {

    // find user - req.user._id and findById method
    // user.avatar = null 
    // better to use two steps - findByIdAndUpdate
    // deleteOnCloudinary
    // now similar to upload on cloudinary

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400, "unauthorized request");

    }

    await deleteOnCloudinary(user?.avatar?.public_id)

    if (!req.file.path) {
        throw new ApiError(403, "file is missing")
    }

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(404, "file not found")
    }

    const result = await uploadOnCloudinary(avatarLocalPath);

    if (!result || !result.secure_url || !result.public_id) {
        throw new ApiError(500, "file uploading failed!!!")
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                avatar: {
                    url: result.secure_url,
                    public_id: result.public_id
                }
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "avatar updated successfully")
        )

})

const updateCoverImage = asyncHandler(async (req, res) => {

    // find user - req.user._id and findById method
    // user.avatar = null 
    // better to use two steps - findByIdAndUpdate
    // deleteOnCloudinary
    // now similar to upload on cloudinary

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400, "unauthorized request");

    }

    await deleteOnCloudinary(user?.coverImage?.public_id)

    if (!req.file.path) {
        throw new ApiError(403, "file is missing")
    }

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(404, "file not found")
    }

    const result = await uploadOnCloudinary(coverImageLocalPath);

    if (!result || !result.secure_url || !result.public_id) {
        throw new ApiError(500, "file uploading failed!!!")
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                coverImage: {
                    url: result.secure_url,
                    public_id: result.public_id
                }
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedUser, "coverImage updated successfully")
        )


})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    changeCurrentPassword
}