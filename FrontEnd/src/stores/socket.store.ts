import {create} from 'zustand'
import type {Socket} from 'socket.io-client'
import io from 'socket.io-client'
interface socketInterface { 
    clientSocket:Socket | null
    initiateSocketConnection:()=>Promise<void>
}


export const useSocket = create<socketInterface>((set,get)=>({
    clientSocket:null,
    initiateSocketConnection:async ()=>{
        try {
            const socket = await io('http://localhost:3000',{
                reconnectionAttempts:5
            }) 
             set({clientSocket:socket})
        } catch (error) {
            console.log("error while initiating sockets",error)
        }
    }
}))