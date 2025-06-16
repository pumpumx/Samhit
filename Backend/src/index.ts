import dotenv from 'dotenv'
import { databaseConnection } from './db/connectDB.ts';
import { app } from './app.ts';
import path from 'path'
import { appPortMethod } from './types/env.type.ts';

const envPath = path.resolve("/home/pumpum/coding/WeTalk/Backend/src","../.env")
dotenv.config({
    path:envPath,
})

databaseConnection()
.then(()=>{
    try {
        const appPort = appPortMethod()
        if(!appPort) throw new Error("App port not available")
        app.listen(appPort , '0.0.0.0' , ()=>{
            console.log(`App running successfully on port ${appPort}`)
    })
    } catch (error) {
        throw new Error("Error while connecting app")
    }
})
