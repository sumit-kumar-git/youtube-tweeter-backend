import { isValidObjectId } from "mongoose";
import { User } from "../model/user.model.js";
import { Video } from "../model/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";




const publishAVideo = asyncHandler(async (req, res) => {

   //TODO: get video , thumnail, title , description and upload to it cloudinary

   // get title and description - req.body
   // get video and thumnail - req.file (keep in your mind multer)
   // finally create - Video.create() and send in response

   const { title, description } = req.body;

   if (!title || !description) {
      throw new ApiError(400, "All fields are required")
   }

   if (!req.files || !req.files.videoFile[0] || !req.files.thumnail[0]) {

      throw new ApiError(403, "All files are required")
   }

   const videoFileLocalPath = req.files.videoFile[0].path

   if (!videoFileLocalPath) {
      throw new ApiError(401, "video file is missing")
   }

   const thumnailLocalPath = req.files.thumnail[0].path

   if (!thumnailLocalPath) {
      throw new ApiError(401, "thumnail file is missing")
   }

   const videoFile = await uploadOnCloudinary(videoFileLocalPath, "video");

   if (!videoFile) {
      throw new ApiError(500, "video file upload to be cloudinary is failed")
   }

   const thumnail = await uploadOnCloudinary(thumnailLocalPath, "image")

   if (!thumnail) {
      throw new ApiError(500, "thumnail file upload to be cloudinary is failed")
   }

   //  const user = await User.findById(req.user?._id)

   //  if (!user) {
   //     throw new ApiError(400,"unauthorized request")
   //  }


   const video = await Video.create({

      title,
      description,
      videoFile: {
         url: videoFile.url,
         public_id: videoFile.public_id,
         duration: videoFile.duration
      },
      thumnail: {
         url: thumnail.url,
         public_id: thumnail.public_id
      },
      owner: { _id: req.user?._id }
   })

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            video,
            "video published successfully"
         )
      )

})

// GET VIDEO BY ID

const getVideoByVideoId = asyncHandler(async (req, res) => {

   const { videoId } = req.params;

   // check for valid object id

   const video = await Video.findById(videoId)

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            video,
            "video fetched successfully"
         )
      )


})

// UPDAING A VIDEO 

const updateAVideo = asyncHandler(async (req, res) => {
   // get video by videoId -req.params
   // get title , description , thumnail etc which to be update-rew.body
   // now u can update anything 

   const { videoId } = req.params
   // check videoId is valid or not 
   // if(!isValidObjectId())

   const { title, description } = req.body;

   const video = await Video.findById(videoId);

   if (!video) {
      throw new ApiError(404, "video not found")
   }
   if (video.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "unauthorized request to update this video")
   }

   video.title = title || video.title
   video.description = description || video.description

   // check for thumnail also 
   
    if (req.file) {
      
      await deleteOnCloudinary(video.thumnail?.public_id,"image")
       
       const thumnailLocalPath = req.file.path 
      const thumnail = await uploadOnCloudinary(thumnailLocalPath,"image")

      video.thumnail.url = thumnail.secure_url
      video.thumnail.public_id = thumnail.public_id
    }


   await video.save()


   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            video,
            "video updated successfully"
         )
      )

})


const deleteAVideo = asyncHandler(async (req, res) => {

   const { videoId } = req.params
   // check for valid id
   const video = await Video.findById(videoId)

   if (!video) {
      throw new ApiError(404, "video not found")
   }

   if (video.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "unauthorized request to delete this video")
   }

   await deleteOnCloudinary(video.videoFile?.public_id, "video")
   await deleteOnCloudinary(video.thumnail?.public_id, "image")

   await video.deleteOne()

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            {},
            "video deleted succeccfully"
         )
      )


})

// TODO:- get all videos of a specific user on the basis of pagination , searching ,soring , filtering etc..

const getAllVideos = asyncHandler(async (req, res) => {

   const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query

   // page- kon sa page chaiye 
   // limit ek page me kitne video chaiye
   // query-generally title lega aur title ke basis pe search krega
   // sortBy-kis basis pe search krna h
   // sortType- kaisa krna asc aur desc most prefereable : desc (latest phle)
   // if userId h - toh isi specific user ke  video lao

   const filter = {
      title: {
         $regex: query,
         $options: "i"
      }
   }

   if (userId) filter.owner = userId

   // $regex-(regular expression) pattern matching based on given query(title) 
   // $options- i: case insesitive based search like:REACT or react or reACt etc

   const videos = await Video.find(filter)
      .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

   //const total = await Video.countDocuments(filter)

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            videos,
            "video fetched successfully"
         )
      )


})

//🎯toggle publish status

const videoPublishStatus = asyncHandler(async (req, res) => {

   const { videoId } = req.params

   const video = await Video.findById(videoId)

   if (!video) {
      throw new ApiError(404, "video not found")
   }

   video.isPublished = !video.isPublished

   await video.save()

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            null,
            { message: `video is now ${video.isPublished ? "public" : "private"}` }
         )
      )

})






export {
   publishAVideo,
   getVideoByVideoId,
   updateAVideo,
   deleteAVideo,
   getAllVideos,
   videoPublishStatus

}