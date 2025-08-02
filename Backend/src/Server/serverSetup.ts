import { Server } from "socket.io";
import { app } from "../app.ts";
import http from 'http'
import { clientMessageHandler } from "./serverMessageHandler.ts";
import jwt from 'jsonwebtoken';
import type { Secret , JwtPayload } from 'jsonwebtoken';

export let userSocketMap = new Map()
export let socketUserMap = new Map()
export interface clientData {
    username:string,
    roomId:string
}
interface offerData{
    username:string,
    offer:RTCSessionDescriptionInit
}
interface answerData {
    fromEmail:string,
    answer:RTCSessionDescriptionInit
}
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
            // console.log("access Token",accessToken)    
            // const verifiedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY as Secret) as JwtPayload

            //Sets the respective user with its socket id 
            // userSocketMap.set(verifiedToken.username, socket.id)  
        
            socket.on('send-user-info',(data:clientData)=>{
                userSocketMap.set(data.username,socket.id)
                socketUserMap.set(socket.id , data.username)
                console.log(data.username)
                socket.join(data.roomId)
                socket.to(data.roomId).emit(`${data.username} joined the room`)
                console.log("roomId",data.roomId)

                const usersInRoom = io.sockets.adapter.rooms.get(data.roomId)
                console.log(usersInRoom)
            })
            //All message handler logic
         
            clientMessageHandler(socket)
            
            socket.on('call-user',(offerData:offerData)=>{
                const {username , offer} = offerData    
                const fromUsername = socketUserMap.get(socket.id)
                const toSendUsername = userSocketMap.get(username)
                socket.to(toSendUsername).emit('incoming-call',{from:fromUsername , offer})
                console.log("username at server ",username , offer)
            })
            //All logic for message listeners
            socket.on('send-answer',(data:answerData)=>{
                const {fromEmail , answer} = data
                const emailToSocket = userSocketMap.get(fromEmail)
                const senderEmail = socketUserMap.get(socket.id)
                socket.to(emailToSocket).emit('recieve-answer',{answerSenderEmail:senderEmail , answer:answer})
            })
            //Disconnect logic 
            socket.on('disconnect', () => {
                console.log("User disconnected with socket id", socket.id)

                //Any logic when user disconnects 
                //Removing user from socketMap
                for(let [uID , sID] of userSocketMap){
                    if(sID == socket.id){
                        userSocketMap.delete(uID)
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