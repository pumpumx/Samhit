
import type { Request, Response, NextFunction } from "express"
import jwt, { type JwtPayload, type Secret } from "jsonwebtoken"
import { AsyncHandler } from "../utils/AsyncHandler.ts"
import { ApiError } from "../utils/ApiError.ts"
import { User } from "../models/User.model.ts" // adjust path as needed

interface CustomRequest extends Request {
  user?: any;
}

const verifyJWT = AsyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const secret = process.env.ACCESS_TOKEN_KEY as Secret;

    if (!accessToken) {
      return next(new ApiError(401, false, "Access token missing"));
    }
   
    if(!secret) return next(new ApiError(401, false, "Access token secret not found"));
    

    const decoded = jwt.verify(accessToken, secret) as JwtPayload;
    console.log(decoded)
    const user = await User.findById(decoded._id).select(
      "-password -avatar -bio -refreshToken -isVerified"
    ).lean();

    if (!user) {
      return next(new ApiError(404, false, "User not found"));
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error at Verify JWT", error);
    return next(new ApiError(401, false, "Invalid or expired token"));
  }
});

export default verifyJWT;
