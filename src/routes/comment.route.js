
import { Router } from "express"
import { auth } from "../middleware/auth.middleware.js"
import { addComment, updateComment, deleteComment, getAllComments,getAllVideoComments } from "../controlers/comment.controller.js"


const router = Router()

router.use(auth)

router.route("/:videoId")
    .post(addComment)
    .get(getAllVideoComments)

router.route("/:userId").get(getAllComments)  

router.route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment)



export default router