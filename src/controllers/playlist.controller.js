import { Playlist } from "../model/playlist.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";



//🎯create a palylist


const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        video: []
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist created successfully"
            )
        )

})


//🎯add video to a playlist

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { videoId, playlistId } = req.params

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(401, "video already exist in playlist")
    }

    playlist.videos.push(videoId)

    await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "video added successfully in playlist"
            )
        )

})

//🎯remove video to a playlist

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { videoId, playlistId } = req.params

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400,"video not found in the playlist")
    }

    playlist.videos = playlist.videos.filter((vid) => (vid.toString() !== videoId.toString()))

    await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "video removed from playlist successfully"
            )
        )

})

//🎯get playlist by id

const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist fetched successfully"
            )
        )

})

//🎯get all playlist of a user

const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params

    const playlists = await Playlist.find({ owner: userId }).populate("videos")

    if (!playlists) {
        throw new ApiError(404, "playlists not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "playlists fetched successfully"

            )
        )

})

//🎯update a playlist

const upadteAPlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"unauthorized request to update this playlist")
    }

    playlist.name = name || playlist.name
    playlist.description = description || playlist.description

    await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "playlist updated successfully"
            )
        )

})

//🎯delete a playlist

const deleteAPlaylist = asyncHandler( async (req,res) => {

    const{ playlistId } = req.params

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404,"playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400,"unauthorized request to delete this playlist")
    }
    await playlist.deleteOne()

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "playlist deleted successfully"
        )
      )
     

})

export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylists,
    upadteAPlaylist,
    deleteAPlaylist
}