import { Router } from "express";
import { loginUser } from "../controllers/user.controller";

const userRouter = Router()

userRouter.route('/login').post(loginUser)

export default userRouter 