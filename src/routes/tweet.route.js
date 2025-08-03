import { Router } from "express";
import { getAllTweets,getTweetById,createATweet,deleteATweet,upadateATweet,getUserAllTweets} from "../controlers/tweet.controller.js"
import { auth } from "../middleware/auth.middleware.js";



const router = Router()
router.use(auth) // sabhi jgh use krne se acha h ek jgh use kr len

router.route("/")
      .post(createATweet)

router.route("/owner-tweets").get(getUserAllTweets)        

router.route("/:tweetId")
      .get(getTweetById)
      .patch(upadateATweet)
      .delete(deleteATweet)   

router.route("/user/:userId").get(getAllTweets)
      
    
      


export default router