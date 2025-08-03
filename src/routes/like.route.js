import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { toggleCommentLike,toggleTweetLike,toggleVideoLike,getAllLikedVideos } from "../controlers/like.controller.js";


const router = Router()
router.use(auth)

router.route("/toggle/video-like/:videoId").post(toggleVideoLike)
router.route("/toggle/tweet-like/:tweetId").post(toggleTweetLike)
router.route("/toggle/comment-like/:commentId").post(toggleCommentLike)
router.route("/liked-videos").get(getAllLikedVideos)




export default router