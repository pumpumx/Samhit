import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
const app = express()

 app.use(json({
    limit:'16kb',
 }))

app.use(cookieParser())

 app.use(urlencoded({
    limit:'50kb'
 }))

 

 //Routes functionality will come here


 
 export {app}
