import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {changeCurrentPassword, getCurrentUser, loginUser, logoutUser, registerUser, updateAvatar,updateCoverImage, updateUserDetails } from "../controlers/user.controller.js";
import multer from "multer";
import { upload } from "../middleware/multer.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(auth, logoutUser)


router.route("/get-user").get(auth, getCurrentUser)
router.route("/update-avatar").patch(auth,upload.single("avatar"),updateAvatar)

router.route("/update-coverImage").patch(auth,upload.single("coverImage"),updateCoverImage)

router.route("/update-userDetalis").patch(auth, updateUserDetails)

router.route("/change-password").patch(auth,changeCurrentPassword)

export default router