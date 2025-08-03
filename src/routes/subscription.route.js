import { Router } from "express";
import { toggleSubscription,getSubscribedToList,getSubscriberList } from "../controllers/subscription.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/:channelId/toggle-subscription").post(auth,toggleSubscription)
router.route("/:channelId/get-subscriber").post(auth,getSubscriberList)
router.route("/:subscriberId/get-subscribedTo").post(auth,getSubscribedToList)



export default router