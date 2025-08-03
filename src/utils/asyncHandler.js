// asyncHandler by promises or then and catch or resolve and reject

const asyncHandler = (requestHAndler) => {
    return (req,res,next) =>{
           Promise.resolve(requestHAndler(req,res,next)).catch((err)=> next(err))
    }       
}

export {asyncHandler}




// asyncHandler by try and catch

//  const asyncHandler = (func) => {async (req,res,next)=>{}} , but we can reomve outer {}

// const asyncHandler = (fn) => async (req,res,next)=> {
//     try {
//         await fn(req,res,next)
//     } catch (err) {
//         res.status(err.code || 500).json({
//             succsess: false,
//             message:err.message || "somthimg went wrong whlie creating asyncHandler"
//         })
//     }
// }