import { type Request} from 'express'
export interface UserPayload{
    _id:string;
    username:string;
    role?:string;
    avatar?:String;
    email:string;
    userid:String;}
declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
  }
}
export interface AuthenticatedRequest extends Request{
    user?:UserPayload
}
export interface RequiredUserRequest extends Request{
    user:UserPayload
}

