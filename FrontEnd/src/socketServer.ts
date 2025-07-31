import {io, type Socket} from 'socket.io-client'

export type clientData  = {
    username:string ,
    roomId:string 
}
let clientSocket:Socket | null = null;
export const clientServerConnection = ()=>{
    const socket = io(`http://localhost:3000`,{
        reconnectionAttempts:5,
    })
    if(!socket) return;
    clientSocket = socket;
    
    clientSocket.on('connect',()=>{
        console.log("Client Connected to the server",clientSocket?.id)
    })
}

export const sendUserDetailsToTheServer = async(data:clientData)=>{
    if(clientSocket && clientSocket.connected){
        console.log(data)
        clientSocket.emit('send-user-info',data) //never wrap this data in the object until unless you are passing an object otherwise the server won't recognize
    }
}