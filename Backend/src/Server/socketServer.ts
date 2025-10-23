import { Server, Socket } from "socket.io";
import { socketEvents } from "./socketEvents.ts";
import { Room } from "./socketRoom.ts";
import { socketUser } from "./socketUser.ts";

export class socketServer {
    private rooms: Map<string, Room> = new Map(); //will be cached in future
    private io:Server;
    constructor(io:Server) {
        this.io = io
        this.io.on('connection', (socket) => this.handleConnection(socket));
    }

    private handleConnection(socket: Socket) { //Responsible for as handling socket connection methods
        console.log("User connected with socketId: ", socket.id);

        socket.on(socketEvents.SEND_USER_INFO, (data: { username: string, roomId: string}) => {
            console.log("User connection recieved")
            this.handleUserJoin(socket , data.username ,  data.roomId);  
        })

        socket.on(socketEvents.SEND_ANSWER ,(data:{roomId:string , answer:RTCSessionDescriptionInit}) =>{
            this.handleUserAnswer(socket , data.roomId , data.answer);
        } ) //Responsible for WebRTC answer

        socket.on(socketEvents.ICE_CANDIDATE , (data:{userRoom:string , iceCandidate:RTCIceCandidateInit })=>{
            this.handleUserIce(socket , data.userRoom , data.iceCandidate);
        })

        socket.on(socketEvents.CALL_USER , (data:{roomId:string , offer:RTCSessionDescriptionInit})=>{
            console.log("Offer recieved from room",data.roomId)
            this.handleUserCall(socket , data.roomId, data.offer);
        })

        socket.on(socketEvents.DISCONNECT , ()=>{
            this.handleDisconnect(socket);
        })
    }

    private async handleUserJoin(socket:Socket  , username:string , roomId:string ){
        try {
            let room = this.rooms.get(roomId);
    
            if(!room){
                room = new Room(roomId)
                this.rooms.set(roomId , room);
            }
            const user = new socketUser(username ,socket.id , roomId);
            console.log("user",user)
            room.addUser(user)
            await socket.join(roomId);
            console.log(socket.rooms)
            this.io.to(roomId).emit(socketEvents.USER_JOINED_ROOM,{username,roomId});
        } catch (error) {
            console.log("Some error occured while handeling user joined",error)
        } //Notify the room member that user has joined the room
    }

    private handleUserAnswer(socket:Socket , roomId:string  , answer:RTCSessionDescriptionInit){
        console.log("answer Recieved sending back to the initiator")
        socket.to(roomId).emit(socketEvents.RECEIVE_ANSWER , {roomId , answer}); //Sending the answer back to the client
    }

    private handleUserIce(socket:Socket , roomId:string , iceCandidate:RTCIceCandidateInit){
        socket.to(roomId).emit(socketEvents.AVAILABLE_CANDIDATE , {roomId , iceCandidate})
    }

    private handleUserCall(socket:Socket , roomId:string , offer:RTCSessionDescriptionInit){
        socket.to(roomId).emit(socketEvents.INCOMING_CALL , {roomId , offer});
    }
            
    private handleDisconnect(socket:Socket){
        this.rooms.forEach((room)=>{
            room.getUser().forEach((user) => {
                    if(user.socketId === socket.id){
                        room.removeUser(user.username);
                        console.log(`User ${user.username} removed from the room ${room.roomId}`);
                    }
            })
        })
    }
};

