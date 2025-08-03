import mongoose, { Schema } from "mongoose";


const videoSchema = new Schema(
  {
    videoFile: {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      }
    },

    thumnail: {
      url: {
        type: String,
        required: true
      },
      public_id: {
        type: String,
        required: true
      },
      duration:{
        type:Number,
      }
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },


    views: {
      type: Number,
      default: 0
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },

  { timestamps: true })

//videoSchema.plugin()

export const Video = mongoose.model("Video", videoSchema)