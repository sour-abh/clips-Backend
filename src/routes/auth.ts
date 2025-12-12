import  express, { type Request,type Response }  from "express";
import jwt  from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import type { RequiredUserRequest } from "../types/types.js";

const userRouter=express.Router();

userRouter.post('/register',async(req:Request,res:Response)=>{
    try{
        const {username,email,password}=req.body;
        const existingUser=await User.findOne({ $or:[{ email},{username}]})
        if(existingUser){
            return res.status(400).json({message:'User alreadyy exists'})
        }
        const user=new User({username,email,password})
        await user.save();
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET||"123123",{expiresIn:'7d'});

        res.status(201).json({
            message:'User created successfully',
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email

            }
        })

    }catch(err){
        res.status(500).json({message:err})
    }
    })

    userRouter.post('/login',async(req:Request,res:Response)=>{
        try{
            const {email,password}=req.body
            const user=await User.findOne({email})
            if(!user||!(await (user as any).comparePassword(password))){
                return res.status(401).json({message:'Invalid credentials'})
            }
            const token =jwt.sign({id:user._id},process.env.JWt_SECRET || "123123",{expiresIn:'7d'})
            res.json({
                message:'login Successfull',
                token,
                user:{
                    id:user._id,
                    username:user.username,
                    email:user.email
                }
            });
        }catch(err){
            res.status(500).json({ message:err})
        }
    })

    userRouter.get('/me',requireAuth,(req:Request,res:Response)=>{
        const {user}=req as RequiredUserRequest
        if(!user){
            res.status(401).json({message:'unauthenticated'})
            return 
        }
        res.json({user:user})
    })


export default userRouter