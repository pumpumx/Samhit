import mongoose from "mongoose";
import type { userSchemaType } from "../schemaTypes/userSchemaType";
import bcrypt from "bcryptjs";
import jwt  from 'jsonwebtoken'
import type { Secret } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.ts";
const UserSchema = new mongoose.Schema<userSchemaType>({
    fullname:{
        type:String,
        required:true,

    },
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        min:6,
        max:20,
        lowercase:true,
    },
    email:{
        type:String,    
        unique:true,
        required:true,
        trim:true,
    },
    role:{
        type:String,
        enum:["User","Doctor","Admin"],
        default:"User"
    },
    age: {
        type:Number,
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
    },
    bio:{
        type:String,
    },
    isAvailable:{
        type:Boolean,
        default:true,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    refreshToken:{
        type:String,
    }
})  

UserSchema.pre('save',function(next){
    if(!this.isModified('password')) next()
    this.password = bcrypt.hashSync(this.password,10)
    next()
})

UserSchema.methods.generateAccessToken =  function():string{
    try {
        const secret:(string | undefined) = process.env.ACCESS_TOKEN_KEY
        const expiry:(string | undefined ) = process.env.ACCESS_TOKEN_EXPIRY
        if(!secret){
            throw new ApiError(500,false,"Jwt secret does not exists")
        }
        if(!expiry){
            throw new ApiError(500,false,"Jwt expiry does not exists")
        }

        const accessToken =  jwt.sign({
            _id:this._id,
            username:this.username,
            email:this.email
        },secret as Secret,
        {expiresIn:expiry})

        return accessToken;
    } catch (error) {
        throw new ApiError(500 , false , "Error at generateAccessToken Method")
   }
}

UserSchema.methods.generateRefreshToken = function ():string{
    const secret = process.env.REFRESH_TOKEN_KEY
    const expiry = process.env.REFRESH_TOKEN_EXPIRY
    
    if(!secret){
        throw new ApiError(500 , false,"Refresh token key not found")
    }
    if(!expiry) {
        throw new ApiError(500 , false,"Refresh token expiry not found")
    }

    const refreshToken = jwt.sign({
        _id: this._id,
        username:this.username
    },secret as Secret, {expiresIn:expiry || "8d" })

    if(!refreshToken) throw new ApiError(500 , false, "Refresh token didnt generated")
    
    return refreshToken;
}

export const User = mongoose.model("user",UserSchema)