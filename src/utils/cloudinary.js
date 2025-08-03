import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { ApiError } from './ApiError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET

});

const uploadOnCloudinary = async (localPath,resourceType="auto") => {
  try {
    if (!localPath) {
      return null
    }
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: resourceType,
      folder: "youtube-tweet"
    })

    if (!response) {
      return null
    }

    // file uploaded successfully on cloudinary 

    fs.unlinkSync(localPath)

    return response
  } catch (error) {
    fs.unlinkSync
    return null
  }


}

const deleteOnCloudinary = async (public_id,resourceType="auto") => {

  try {
    if (!public_id) {
      throw new ApiError(404, "public_id is required");

    }

    const response = await cloudinary.uploader.destroy(public_id,{
      resource_type:resourceType
    })

    if (response.result) {
      console.log(response.result);
    }



    if (response.result !== "ok" && response.result !== "not found") {
      throw new ApiError(404, "image not found on cloudinary")
    }

  } catch (error) {


    console.log("cloudinary delete ERROR !!!:", error)

    throw new ApiError(404, "failed to delete image from cloudinary")

  }

}






export { uploadOnCloudinary, deleteOnCloudinary }