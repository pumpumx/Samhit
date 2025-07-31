import { createContext, useContext, useMemo } from "react"
import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"


const SocketContext = createContext(null)


export const useSocket = ()=>{
    return useContext(SocketContext) 
}

export const SockettProvider = (props:void)=>{
    const socket = useMemo(
        ()=>{
            io("http://localhost:3000")
        },
        []
    )

    return (
        <SocketContext.Provider value={{socket}}>
            {props.children}
        </SocketContext.Provider>
    )
}