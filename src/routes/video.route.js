import { Router } from "express";
import { getAllVideos, publishAVideo, getVideoByVideoId, updateAVideo,videoPublishStatus, deleteAVideo } from "../controlers/video.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import multer from "multer";



const router = Router()



router.route("/")
    .get(getAllVideos)
    .post(auth, upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumnail",
            maxCount: 1
        }
    ]), publishAVideo)
router.route("/:videoId")

    .get(auth, getVideoByVideoId)
    .patch(auth, updateAVideo)
    .delete(auth, deleteAVideo)

 router.route("/toggle/publish-video/:videoId").patch(auth,videoPublishStatus)     






export default router