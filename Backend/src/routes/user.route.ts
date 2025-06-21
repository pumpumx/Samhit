import { Router } from "express";
import { deleteUserAccount, loginUser, registerUser } from "../controllers/user.controller.ts";
import verifyJWT from "../middlewares/verifyJwt.ts";
const userRouter = Router()

userRouter.route('/login').post(loginUser)
userRouter.route('/register-user').post(registerUser)
userRouter.route('/delete-user-account').delete(verifyJWT,deleteUserAccount)
export default userRouter 