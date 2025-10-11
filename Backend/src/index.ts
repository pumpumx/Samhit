import {config} from 'dotenv'
import { databaseConnection } from './db/connectDB.ts';
import path from 'path'
import http from 'http'
import { app } from './app.ts';
import { Server } from 'socket.io';
import { socketServer } from './Server/socketServer.ts';
const envPath:(string) = path.resolve("/home/pumpum/coding/WeTalk/Backend/src","../.env")  
config()
    
await databaseConnection()
.then(()=>{
    try {
        console.log("Database connected succesfully")
    } catch (error) {
        console.log(error)
    }
})

const server = http.createServer(app);
const io = new Server(server , {
    cors:{origin:"*",
        credentials:true,
    },
    transports:["polling" , "websocket"]
})

new socketServer(io);

const port = Number(process.env.APP_PORT)
server.listen(port , ()=>{
    console.log("Server listening on port" , port)
})

