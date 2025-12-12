import mongoose from "mongoose";

const clipSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    filename:{
        type:String,
        required:true
    },
    originalName:{
        type:String,
        required:true
    },
    fileId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true

    },
    title:{
        type:String,
        required:true,
        maxLength:100
    },
    description:{
        type:String,
        maxLength:500
    },
    tags:{
        type:[String],
        default:[]
    },duration:{
        type:Number,
        default:0
    },
    size:{
        type:Number,
        required:true
    },
    thumbnail:{
        type:String,
        default:''
    },
    isPublic:{
        type:Boolean,
        default:true
    },
    views:{
        type:Number,
        default:0
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
},{timestamps:true})

clipSchema.index({ userId:1,createdAt:-1});
clipSchema.index({tags:1});

export default mongoose.model('Clip',clipSchema)