import { Router } from "express";
import { createPlaylist,addVideoToPlaylist,removeVideoFromPlaylist,getPlaylistById,getUserPlaylists,upadteAPlaylist,deleteAPlaylist } from "../controlers/playlist.controller.js";
import { auth } from "../middleware/auth.middleware.js";



const router = Router()
router.use(auth)


router.route("/").post(createPlaylist)

router.route("/:playlistId")
      .get(getPlaylistById)
      .patch(upadteAPlaylist)
      .delete(deleteAPlaylist)

router.route("/add/:videoId/:playlistId").post(addVideoToPlaylist)    
router.route("/remove/:videoId/:playlistId").post(removeVideoFromPlaylist)
router.route("/user/:userId").get(getUserPlaylists)  



export default router