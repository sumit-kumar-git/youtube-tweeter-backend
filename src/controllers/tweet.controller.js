import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";
import { isValidObjectId } from "mongoose";

//🎯create a tweet

const createATweet = asyncHandler(async (req, res) => {

    //get content - req.body
    // now create a tweet by putting - owner:req.user?._id

    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "content is required for creating a tweet")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet is created successFully"
            )
        )


})
//🎯upadate a tweet

const upadateATweet = asyncHandler(async (req, res) => {
    // get content - req.body
    // get tweetId - req.params
    // find tweet and update it(*check for authorization)

    const { content } = req.body
    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "unauthorized request to edit this tweet")
    }
    tweet.content = content || tweet.content;

    tweet.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet updated successfully"
            )
        )

})

//🎯delete a tweet

const deleteATweet = asyncHandler(async (req, res) => {

    // get tweetId - req.params
    // find tweet and delete it(*check for authorization)

    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "unauthorized request to delete this tweet")
    }

    await tweet.deleteOne()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "tweet deleted successfully"
            )
        )

})

//🎯get by Id 

const getTweetById = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet fetched successfully"
            )
        )

})

//🎯get all tweets of a user

const getAllTweets = asyncHandler(async (req, res) => {

    // get userId-req.params
    // find all tweets of user - Tweet.find()
    // sort latest first - created :-1

    const { userId } = req.params

    const tweets = await Tweet.find({ owner: userId }).sort({createdAt:-1}) //latest first

    if (!tweets) {
        throw new ApiError(404, "tweets not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "all tweets fetched successfully"
            )
        )

})

//🎯get all tweets of owner

const getUserAllTweets = asyncHandler(async (req, res) => {

    // get userId-req.user._id
    // find all tweets of user - Tweet.find()
    // sort latest first - created :-1
    const userId = req.user?._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user Id");
        
    }
   
    const tweets = await Tweet.find({ owner: userId }).sort({createdAt:-1}) //latest first

    if (!tweets) {
        throw new ApiError(404, "tweets not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "all tweets fetched successfully"
            )
        )

})

export {
    createATweet,
    upadateATweet,
    deleteATweet,
    getTweetById,
    getAllTweets,
    getUserAllTweets
}










// alok kumar
// pushpa film
// how to release pushpa 