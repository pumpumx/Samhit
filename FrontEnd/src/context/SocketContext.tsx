import { createContext, useContext, useMemo } from "react"
import { io, Socket } from "socket.io-client"

const SocketContext = createContext<Socket | null>(null)

export const useSocket = () => {
    return useContext(SocketContext) 
}

export const SocketProvider = (props: { children: React.ReactNode }) => {
    const socket = useMemo(() => io("http://localhost:3000"), [])

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}


export class PeerConnection{ //Class for handling webRTC connections 
    constructor(){
        return;
    }

    async SignalingConnection(){

    }
};