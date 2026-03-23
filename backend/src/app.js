import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()


//app.use is used for configuration and middleware

app.use(cors({
    origin: process.env.CORS_ORIGIN, //from where data will be accepted in backend 
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.routes.js'
import vehicleRouter from './routes/vehicle.routes.js'


//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/vehicles", vehicleRouter)



// http://localhost:8000/api/v1/users/register

export default app