import app from './app.js';
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        app.on("error", (error)=>{
            console.error("ERR: ", error)
            throw error
        })
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!!", error)
})
