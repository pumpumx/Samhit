import { ApiError } from '../utils/ApiError.ts'
import { AsyncHandler } from '../utils/AsyncHandler.ts'
import { User } from '../models/User.model.ts'
import bcrypt from 'bcryptjs'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { registerUserType } from '../types/registerUser.type.ts'
import type { loginUserType } from '../types/loginUser.type.ts'
import type { Response , Request } from 'express'
import isEmail from 'validator/lib/isEmail.js'


interface CustomRequest extends Request{
    user?:any
}   

const loginUser = AsyncHandler(async (req:Request, res:Response) => {

    const { usernameOrEmail, password }:loginUserType = req.body;

    const validateUsernameOrEmail: string = usernameOrEmail.trim();
    const validatePassword: string = password;

    if (typeof validateUsernameOrEmail !== 'string' || !validateUsernameOrEmail || validateUsernameOrEmail.length > 30) {
        throw new ApiError(400, false, "Please enter a valid username")
    }

    if (!validatePassword) throw new ApiError(400, false, "Password field cannot be empty")
    if(validatePassword.length < 6 ) throw new ApiError(400,false,"Password should be atleast 6 chars")

    const user = await User.findOne({  
        $or: [{ username: validateUsernameOrEmail}, {email: validateUsernameOrEmail }]
    })

    if (!user) throw new ApiError(400, false, "No such user exists")

    const storedPassHash: string = user.password
    const isPassCorrect:Promise<boolean> =  bcrypt.compare(validatePassword, storedPassHash)

    if (!isPassCorrect) throw new ApiError(500, false, "Incorrect password")

    const accessToken = user.generateAccessToken()  

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "PRODUCTION",
            sameSite: "lax"
        })
        .json(
            new ApiResponse(200, "User Logged in Succcessfully", { user })
        )
})

const registerUser = AsyncHandler(async(req:Request , res:Response)=>{
    const {username,password,age,role,email,fullName}:registerUserType= req.body

    if([username,password,email,fullName].some((val)=>!val?.trim())){
        throw new ApiError(400,false,"All fields are required")
    }

    if(username.length < 6) throw new ApiError(400,false,"Username length should be atleast 6 chars long")
    
    if(!isEmail(email)) throw new ApiError(400,false,"Invalid email format")
    
    const isAlphaRegex = /^[A-Za-z]+$/
    if(!isAlphaRegex.test(fullName)) throw new ApiError(400,false,"Invalid full name format")

    //Validating if user already exists or not!!
     const user = await User.findOne({  
        $or: [{ username: username}, {email: email }]
    })

    if(user) throw new ApiError(400,false,"User already exists")

    const newUser = new User({
        username,
        fullname:fullName,
        age,
        role,
        password,
        email,
    })

    await newUser.save()

    const accessToken = newUser.generateAccessToken()
    const refreshToken = newUser.generateRefreshToken()

    newUser.refreshToken = refreshToken;
    newUser.save({validateBeforeSave:false})

    const options = {
        httpOnly:true,
        secure: process.env.PROD === 'PRODUCTION',
        lax:"same-site"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,"User registered Successfully",{user})
    )
    
})


const deleteUserAccount = AsyncHandler(async (req:CustomRequest , res:Response)=>{
    const user = req.user;

    if(!user) throw new ApiError(400 ,false , "User unauthenticated")

    await User.findByIdAndDelete(user._id)

    //Delete all other documents related to this user !!!

    return res
    .status(200)
    .clearCookie('accessToken')
    .json(
        new ApiResponse(200 , "User Account deleted successfully")
    )
})

    
export {
    loginUser,
    registerUser,
    deleteUserAccount
}

 