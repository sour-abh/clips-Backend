import express, { type NextFunction, type Request, type Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import * as dotenv from 'dotenv'
import userRouter from './routes/auth.js'
import clipsRouter from './routes/clip.js'
const app =express()
dotenv.config()
app.use(helmet())
app.use(cors({
    origin:['http://localhost:3000'],
    credentials:true
}))
const limiter =rateLimit({
    windowMs:15*60*1000,
    max:100
})
app.use('/api/',limiter)

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true}))
mongoose.connect(process.env.MONGO_URI??'').then(()=>console.log('MongoDB Connected')).catch(err=>console.error(err))

const conn=mongoose.connection

let gfsBucket;

conn.once('open',()=>{
        if (conn.db) {
            gfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'videos' // Must match the bucket name used in multer-gridfs-storage
        });
        app.set('gfsBucket',gfsBucket)
        
        }
        
})

app.use('/api/auth',userRouter)
app.use('/api/clips',clipsRouter)

app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
    console.error(err.stack);
    res.status(500).json({
        message:'Something went wrong!',
        error:process.env.NODE_ENV==='development'? err.message:{}
    })
})

app.use((req:Request,res:Response)=>{
    res.status(404).send("not found")
})
const Port=process.env.PORT||5000;  
app.listen(Port,()=>console.log(`Serve running on port ${Port}`))