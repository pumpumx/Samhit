import type { Socket } from "socket.io";
import { serverIo } from "../index.ts";
import { userSocketMap } from "./serverSetup.ts";
import { ApiError } from "../utils/ApiError.ts";


export const clientMessageHandler = (socket:(Socket | undefined))=>{

    if(!socket) throw new ApiError(500 , false , "No socket connection found")
    socket.on('send_private_message',(data , username)=>{
        try {
            var socketID:(string | string[]) = "";
            for(let [uID , sID] of userSocketMap){
                if(uID === username){
                    socketID = sID;
                }
            }
            serverIo?.to(socketID).emit(data) 
            console.log("socketIO")
            console.log("Message sent successfully");
        } catch (error) {
            console.log("Error while sending private message" , error)
        }
    })

    socket.on('join-room',(data)=>{
        const {emailID , roomID} = data
        socket.join(roomID)
        socket.broadcast.to(roomID).emit("user-joined",{emailID})
    })
}