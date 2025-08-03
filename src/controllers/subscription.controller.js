import { Subscription } from "../model/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";



//🎯toggleSubscription

const toggleSubscription = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(200, "Invalid channel Id")
    }

    if (channelId.toString().trim() === req.user?._id) {
        throw new ApiError(400, "You can't subscribed yourself")
    }

    const existedSubscriber = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (existedSubscriber) {
        await existedSubscriber.deleteOne()

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "channel unsubscribed"
                )
            )
    }

    const newSubscriber = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (!newSubscriber) {
        throw new ApiError(400, "something went wrong while subscribing")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "channel subscribed"
            )
        )

})

//🎯get subscriber list

const getSubscriberList = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const subscribersList = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username avatar")

    if (!subscribersList) {
        throw new ApiError(400, "subscribers not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribersList,
                "subscribers fetched successfully"
            )
        )

})

//🎯get subscribedTo list

const getSubscribedToList = asyncHandler(async (req, res) => {

    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber Id")
    }

    const subscribedToList = await Subscription.find({
        subscriber: subscriberId
    }).populate("channel", "username avatar")

    if (!subscribedToList) {
        throw new ApiError(404, "subscribedTo channel not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedToList,
                "subscribedTo channel fetched successfully"
            )
        )

})


export{
    toggleSubscription,
    getSubscribedToList,
    getSubscriberList
}