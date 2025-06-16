import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.ts";

export const databaseConnection = async () => {
    try {
        const mongoUri:(string | undefined) = process.env.MONGODB_URL
        console.log(mongoUri)
        const mongooseConnection:object = await mongoose.connect(`${mongoUri}`,)
    } catch (error) {
        console.log("error at database  connection",error)
    }
}