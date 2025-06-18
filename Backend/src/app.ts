import express, { json, urlencoded } from "express";
import type { Server } from "http";

const app = express()

 app.use(json({
    limit:'16kb',
 }))

 app.use(urlencoded({
    limit:'50kb'
 }))

 //Routes functionality will come here
 export {app}
