import { AsyncHandler } from "../utils/AsyncHandler";
import type { Request,Response } from "express";
const connectUser = AsyncHandler(async (req:Request,res:Response)=>{
    const {emailID , roomID} = req.body
    

})