import {Document} from "mongoose";

export interface userSchemaType extends Document{
    fullname:string,
    username:string,
    email:string,
    age:number,
    password:string,
    role:string,
    bio:string,
    avatar?:string,
    isVerified:boolean,
    isAvailable:boolean,   
    refreshToken:string,
    generateAccessToken():string,
    generateRefreshToken():string
}