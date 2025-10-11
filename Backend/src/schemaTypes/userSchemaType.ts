import {Document} from "mongoose";

export interface userSchemaType extends Document{
    fullname:string,
    username:string,
    accountType:string,
    email:string,
    isEmailVerfied:boolean,
    age:number,
    password:string,
    bio:string,
    avatar?:string,
    isVerified:boolean,
    isAvailable:boolean,   
    refreshToken:string,
    generateAccessToken():string,
    generateRefreshToken():string
}