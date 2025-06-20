
import { ApiError } from '../utils/ApiError.ts'
import { AsyncHandler } from '../utils/AsyncHandler'
import { User } from '../models/User.model.ts'
import bcrypt from 'bcryptjs'
import { ApiResponse } from '../utils/ApiResponse.ts'
import type { registerUserType } from '../types/registerUser.type.ts'
import type { loginUserType } from '../types/loginUser.type.ts'
import type { Response , Request } from 'express'
import {isEmail , isAlpha} from 'validator'
const loginUser = AsyncHandler(async (req:Request, res:Response) => {

    const { usernameOrEmail, password }:loginUserType = req.body;

    const validateUsernameOrEmail: string = usernameOrEmail.trim();
    const validatePassword: string = password;

    if (typeof validateUsernameOrEmail !== 'string' || !validateUsernameOrEmail || validateUsernameOrEmail.length > 30) {
        throw new ApiError(400, false, "Please enter a valid username")
    }

    if (!validatePassword) throw new ApiError(400, false, "Please enter a valid username")

    const user = await User.findOne({
        $or: [{ username: validateUsernameOrEmail, email: validateUsernameOrEmail }]
    })

    if (!user) throw new ApiError(400, false, "No such user exists")

    const storedPassHash: string = user.password

    const isPassCorrect: boolean = bcrypt.compareSync(validatePassword, storedPassHash)

    if (isPassCorrect === false) throw new ApiError(500, false, "Incorrect password")

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

const registerUser = AsyncHandler(async(req , res)=>{
    const {username,password,age,role,email,fullName}:registerUserType= req.body

    if([username,password,role,email,fullName].some((val)=>!val?.trim())){
        throw new ApiError(400,false,"All fields are required")
    }

    if(username.length < 6) throw new ApiError(400,false,"Username length should be atleast 6 chars long")
    
    if(!isEmail(email)) throw new ApiError(400,false,"Invalid email format")

    if(!isAlpha(fullName)) throw new ApiError(400,false,"Invalid full name format")

    const user = new User({
        username,
        fullname:fullName,
        age,
        role,
        password,
        email,
    })

    await user.save()

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    user.save({validateBeforeSave:false})

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

export {
    loginUser,
    registerUser
}

