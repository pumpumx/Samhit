import { Server } from "socket.io";
import { app } from "../app.ts";
import http from 'http'
import { clientMessageHandler } from "./serverMessageHandler.ts";
import jwt from 'jsonwebtoken';
import type { Secret , JwtPayload } from 'jsonwebtoken';

export let socketMap = new Map()

export async function serverInitialisation() {
    try {
        const server = http.createServer(app)
        const io = new Server(server, {
            cors: { 
                origin: process.env.PROD === 'PRODUCTION' ? false : "*",
                credentials: true
            },
            connectionStateRecovery: {
                skipMiddlewares: true,
                maxDisconnectionDuration: 2 * 60 * 1000,
            },
            connectTimeout: 45000,
            transports: ['polling', 'websocket'],
        })

        if (!io) throw new Error("Failed to initialise socket server")


        io.on('connection', (socket) => {
            console.log("User connected with socketId", socket.id)

            //verify authentication method , Uncomment it to enable only authenticated socket io request

            // const accessToken: (string | any) = socket.handshake.auth    
            // const verifiedToken = jwt .verify(accessToken, process.env.ACCESS_TOKEN_KEY as Secret) as JwtPayload

            //Sets the respective user with its socket id s
            // socketMap.set(verifiedToken.username, socket.id)  

            //Al message handler logic
         
            clientMessageHandler(socket)

            //All logic for message listeners

            //Disconnect logic 
            socket.on('disconnect', () => {
                console.log("User disconnected with socket id", socket.id)

                //Any logic when user disconnects 
                //Removing user from socketMap
                for(let [uID , sID] of socketMap){
                    if(sID == socket.id){
                        socketMap.delete(uID)
                        console.log("user deleted from the socket Map")
                    }
                }

            })
        })
        
        const appPort: (number | undefined) = Number(process.env.APP_PORT) || 3001
        if (!appPort) throw new Error("App port not available")

        server.listen(appPort, '0.0.0.0', () => {
            console.log(`App running successfully on port ${appPort}`)
        })

        return io;
    } catch (error) {
        console.log("Failed to start socket io server", error)
    }
}