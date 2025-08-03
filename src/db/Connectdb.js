import mongoose from "mongoose"
// import { DB_NAME } from "../constants.js"

export const connectDB = async () => {
    try {
         
      const connectionInstanse = await mongoose.connect(`${process.env.MONGODB_URI}`)

      console.log(`MONGO_DB Connection !!! HOST:${connectionInstanse.connection.host}`)
        
    } catch (error) {
        console.log(`MONGO_DB Connection ERROR !!! ${error}`)
        process.exit(1)
    }
}