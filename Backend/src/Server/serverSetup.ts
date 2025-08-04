import { Server } from "socket.io";
import { app } from "../app.ts";
import http from 'http'
import jwt from 'jsonwebtoken';
import type { Secret , JwtPayload } from 'jsonwebtoken';

export let userSocketMap = new Map()
export let socketUserMap = new Map()
export interface clientData {
    username:string,
    roomId:string
}
interface offerData{
    userRoom:string,
    offer:RTCSessionDescriptionInit
}
interface answerData {
    userRoom:string,
    answer:RTCSessionDescriptionInit
}
interface iceCandidates {
    iceCandidate:RTCIceCandidateInit,
    userRoom:string
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
                userSocketMap.set(data.username,socket.id) //Sets the username to socket ID
                socketUserMap.set(socket.id , data.username) //Sets the socket id to username

                socket.join(data.roomId) //Responsible for making user join respective rooms
                
                socket.to(data.roomId).emit(`${data.username} joined the room`)

                const usersInRoom = io.sockets.adapter.rooms.get(data.roomId)
                console.log("All users in this specific room" , usersInRoom)
            })

            //All message handler logic
         
            socket.on('call-user',(offerData:offerData)=>{ //As soon as the user joins it sends the web rtc call to the other user in the room
                const {userRoom , offer} = offerData    
                const fromUsername = socketUserMap.get(socket.id) //The person sending the offer username
                // const toSendUsername = userSocketMap.get(username) //The person whom the offer will go , username. This field required from the client
                console.log("user room " ,userRoom)
                socket.to(userRoom).emit('incoming-call',{userRoom , offer}) //Sends the offer to the designated user
            })
            
            //Responsible for sending web RTC answer
            socket.on('send-answer',(data:answerData)=>{ //On send answer event the answer comes from The user
                const {userRoom , answer} = data
                // const socketId_of_the_reciever = userSocketMap.get(fromUserRoom)
                const senderEmail = socketUserMap.get(socket.id) //The one who sent the answer
                console.log("recieved answer" , userRoom , answer)
                socket.to(userRoom).emit('recieve-answer',{userRoom , answer})
                console.log("answer")
            })

            //Exchanging ice-candidates 
            socket.on('ice-candidate',(data:iceCandidates)=>{
                const {iceCandidate , userRoom} = data
                console.log("ice candidate" , iceCandidate)
                socket.to(userRoom).emit("available-candidate",(iceCandidate));
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