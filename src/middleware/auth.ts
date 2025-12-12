import jwt ,{type JwtPayload}from 'jsonwebtoken'
import  User from '../models/User.js'
import type { NextFunction, Response ,Request} from 'express'
import { type AuthenticatedRequest, type RequiredUserRequest, type UserPayload } from '../types/types.js'
const requireAuth=async(req:Request,res:Response,next:NextFunction)=>{
    
    try{
        
        const token=req.header('Authorization')?.replace('Bearer','').trim()
        if(!token){
            
            return res.status(401).json({
                message:'Access denied. No token Provided'
            })
        }

        
        const decoded=jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload;
    
        req.user=await User.findById(decoded.id ).select('-password') as UserPayload
        
        (req as RequiredUserRequest).user=req.user
            
        if(!req.user){
            
            return res.status(401).json({message:'unauthorized'})

        }
        
        next()
    }catch(error){
        res.status(401).json({message:"invalid Token"})

    }
};

const optionalAuth=async (req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
    try{
        const token=req.header('Authorization')?.replace('Bearer','').trim()
        if(token){
            const decoded=jwt.verify(token,process.env.JWT_SECRET||"123123") as JwtPayload
            req.user=await User.findById(decoded.id).select('-password') as UserPayload
        }
        next()
    }catch(error){
        next()

    }
}

export  {requireAuth,optionalAuth}