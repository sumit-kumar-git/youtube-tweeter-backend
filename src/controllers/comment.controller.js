import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Comment } from "../model/comment.model.js";



//🎯 add comment or create comment



const addComment = asyncHandler(async (req, res) => {

    const { content } = req.body
    const { videoId } = req.params

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(409, "comment not created")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment created successfully"
            )
        )

})

//🎯upadte comment or edit a comment

const updateComment = asyncHandler(async (req, res) => {

    const { content } = req.body
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "unauthorized request to update this comment")
    }

    comment.content = content || comment.content

    await comment.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "comment updated successfully"
            )
        )

})

//🎯delete comment

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "unauthorized request to delete this comment")
    }

    await comment.deleteOne()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "comment deleted successfully"
            )
        )

})

//🎯get all comments of a specific user

const getAllComments = asyncHandler(async (req, res) => {

    const { userId } = req.params

    const comments = await Comment.find({ owner: userId }).sort({ createdAt: -1 })

    if (!comments) {
        throw new ApiError(404, "comments not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "comments fetched successsfully"
            )
        )

})


const getAllVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const comments = await Comment.find({ video: videoId }).sort({ createdAt: -1 })

    if (!comments) {
        throw new ApiError(404, "comments not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "comments fetched successsfully"
            )
        )

})




export {
    addComment,
    updateComment,
    deleteComment,
    getAllComments,
    getAllVideoComments

}