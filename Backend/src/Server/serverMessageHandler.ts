import type { Socket } from "socket.io";
import { serverIo } from "../index.ts";
import { socketMap } from "./serverSetup.ts";


export const clientMessageHandler = (socket:Socket)=>{

    socket.on('send_private_message',(data , username)=>{
        try {
            var socketID:(string | string[]) = "";
            for(let [uID , sID] of socketMap){
                if(uID === username){
                    socketID = sID;
                }
            }
            serverIo?.to(socketID).emit(data) 
            console.log("Message sent successfully");
        } catch (error) {
            console.log("Error while sending private message" , error)
        }
    })
}