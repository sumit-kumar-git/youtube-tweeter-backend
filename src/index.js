//require('dotenv').config({path:'.\.env'})
import dotenv from "dotenv"
import { connectDB } from "./db/Connectdb.js";
import { app } from "./app.js";

dotenv.config({path:'.\.env'})


console.log("server started");

// connection ka function dusre file me likho aur isme import kra lo
connectDB()
.then(()=>{
    app.on("error",(err)=>{
        throw err
    })

    app.listen(process.env.PORT ||8000,()=>{
        // console.log(`servere is running at port ${process.eventNames.PORT}`);
        
    })
})
.catch((err) => {
      console.log(`MONGO_DB Connection error !!! ${err}`)
      throw err
})

// connection ka function smae file me likho aur isi me turnt execute kra lo like IIFE (() => {})()


//    import mongoose from "mongoose";
//     (async()=>{
//         try {
//            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//            app.on("error",(err)=>{
//                  throw err
//            })
//            app.listen(process.env.PORT ||8000 ,()=>{
//             console.log(`application is running at port ${process.env.PORT}`);
            
//            })
//         } catch (error) {
//             throw error
//         }
//     })()
