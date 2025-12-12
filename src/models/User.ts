import mongoose, { model } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema =new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3,
        maxLength:30
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minLength:8
    },
    avatar:{
        type:String,
        default: ''
    }
},{
    timestamps:true
})

UserSchema.pre('save', async function(this: mongoose.Document & { password: string }, next) {
    if (!this.isModified('password')) return next;
    this.password = await bcrypt.hash(this.password, 12);
    next;
});
UserSchema.methods.comparePassword=async function (candidatePassword:string):Promise<boolean>{
    return await
    bcrypt.compare(candidatePassword,this.password)
}
const User=mongoose.model('User', UserSchema)


export default User