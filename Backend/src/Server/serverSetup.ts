import { Server } from "socket.io";
import { app } from "../app.ts";
import http from 'http'
let socketMap = new Map()

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


        io.on('connection',(socket)=>{
            console.log("User connected with socketId",socket.id)
            const accessToken = socket.handshake.auth
            socketMap.set('0',socket.id)
            //All logic for message listeners


        })

        io.on('disconnect',(socket)=>{
            console.log("User disconnected with socket id",socket.id)

            //Any logic when user disconnects



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