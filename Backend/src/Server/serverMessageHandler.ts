import type { Socket } from "socket.io";
import { serverIo } from "../index.ts";
import { socketMap } from "./serverSetup.ts";


const clientMessageHandler = (socket:Socket)=>{
    socket.on('send_private_message',(data , username)=>{
        var socketID:(string | string[]);
        socketMap.forEach(([uID , sID])=>{
            if(uID == username) socketID = sID;
        })
        serverIo?.to(socketID).emit(data) //Solve this socketID issue

    })
}