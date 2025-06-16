import express, { json, urlencoded } from "express";

const app = express()

 app.use(json({
    limit:'16kb',
 }))

 app.use(urlencoded({
    limit:'50kb'
 }))

 //Routes functionality will come here

 export {app}
