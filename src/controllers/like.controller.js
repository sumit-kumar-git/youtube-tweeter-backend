import { Like } from "../model/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//🎯toggleVideoLike

const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const existingLike = await Like.findOne({
        likedBy: req.user?._id,
        video: videoId

    })

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Video unliked"
                )
            )
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video liked"
            )
        )

})

//🎯toggleTweetLike

const toggleTweetLike = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    const existingLike = await Like.findOne({
        likedBy: req.user?._id,
        tweet: tweetId

    })

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Tweet unliked"
                )
            )
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Tweet liked"
            )
        )

})


//🎯toggleCommentLike

const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    const existingLike = await Like.findOne({
        likedBy: req.user?._id,
        comment: commentId
    })

    if (existingLike) {
        await existingLike.deleteOne()
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Comment unliked"
                )
            )
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment liked"
            )
        )


})


//🎯getAllLikedVideos

const getAllLikedVideos = asyncHandler(async (req, res) => {

    const likes = await Like.find({
        likedBy: req.user?._id,
        video: { $exists: true }
    }).populate("video")

    const likedVideos = likes.map((like) => like.video)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "liked videos fetched successfully"

            )
        )
})


export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getAllLikedVideos
}