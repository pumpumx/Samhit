
import { SocketEvents } from "@/constants/socketEvents";
import { io, type Socket } from "socket.io-client";

export class webRTCMethods {
    public peer: RTCPeerConnection
    protected isPolite: boolean
    // protected answer: Promise<RTCSessionDescriptionInit>

    constructor() {
        this.peer = new RTCPeerConnection();
        this.isPolite = false;
    }

    async createOfferForReciever():Promise<RTCSessionDescriptionInit> {
        const offer = await this.peer.createOffer()
        await this.peer.setLocalDescription(offer);
        return offer
         //This will be the first thing that would  return or be signalled to another user
    }

    async createAnswerForInitiator(roomId:string , offer: RTCSessionDescriptionInit) {
        await this.peer?.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peer?.createAnswer();
        await this.peer?.setLocalDescription(answer)
        
        console.log("remote answer created")
        // clientSocket?.sendAnswerToAnotherUser(roomId,answer)
        //signal the answer to the other person 
        const clientSocketInstance = clientSocketMethods.instance; //This is called bloody singleton pattern
        clientSocketInstance.clientSocket.emit(SocketEvents.SEND_ANSWER , {
            roomId:roomId,
            answer:answer
        })
    }
    async setOfferRecievedFromAnotherUser(roomId:string , offer: RTCSessionDescriptionInit) {
        await this.peer.setRemoteDescription(offer);
        console.log("Offer set as localDescription")
        this.createAnswerForInitiator(roomId , offer);
    }

    async setAnswerRecievedFromInitiator(roomId:string , answer: RTCSessionDescriptionInit) {
        await this.peer.setRemoteDescription(answer);

        console.log("answer recieved",answer)
        //Find ice peers afterwards!! 
        // this.peer.onicecandidate = async (e)=>{
        //     if(e.candidate != null){    
        //         // clientSocket?.sendIceCandidateToRemote(roomId , e.candidate)
        //     }
        // }
    }

    async setICECandidate(iceCandidate: RTCIceCandidateInit) {
        await this.peer.addIceCandidate(iceCandidate)
    }
}


export class clientSocketMethods extends webRTCMethods {

    public clientSocket: Socket
   
    public static instance:clientSocketMethods
    
   private constructor() {
        super() 
        const webSocketUrl = import.meta.env.VITE_BACKEND_URL
        console.log(webSocketUrl)
        const socket = io(webSocketUrl);
        this.clientSocket = socket
        this.SocketHandler()
    }

    //Listening Events

    public static getInstance(){
        if(!clientSocketMethods.instance){
            clientSocketMethods.instance = new clientSocketMethods()
        }
        return clientSocketMethods.instance
    }

    private SocketHandler() {
        this.clientSocket.on(SocketEvents.USER_JOINED_ROOM , (data:{username:string , roomId:string})=>{
            this.roomJoinedSuccessfully({username:data.username , roomId:data.roomId});
        })
        this.clientSocket.on(SocketEvents.RECEIVE_ANSWER, (data: {roomId:string, answer: RTCSessionDescriptionInit }) => {
            console.log("Recieving another user answer",data.answer)
            this.setAnswerRecievedFromInitiator(data.roomId , data.answer);
        })

        this.clientSocket.on(SocketEvents.INCOMING_CALL, (data: { roomId:string , offer: RTCSessionDescriptionInit }) => {
            console.log("You are getting an offer from anothre user");
            this.setOfferRecievedFromAnotherUser(data.roomId , data.offer);
        })

        this.clientSocket.on(SocketEvents.AVAILABLE_CANDIDIATE, (data: { iceCandidate: RTCIceCandidateInit }) => {
            console.log("candidates available",data.iceCandidate)
            this.setICECandidate(data.iceCandidate);
        })

        this.clientSocket.on(SocketEvents.DISCONNECT, ()=>this.userDisconnected())

    }
    //Sending events
    public sendClientInfoToBackend(data: { username: string, roomId: string }) {
        this.clientSocket.emit(SocketEvents.SEND_USER_INFO, {
            username: data.username,
            roomId: data.roomId
        })
    }

    public roomJoinedSuccessfully(data:{username:string , roomId:string}){
        console.log(`${data.username} joined room ${data.roomId}`)
    }

    public sendAnswerToAnotherUser(roomId: string , answer:RTCSessionDescriptionInit) {
        this.clientSocket.emit(SocketEvents.SEND_ANSWER , {
            roomId,
            answer
        })
    }

    sendIceCandidateToRemote(roomId:string , iceCandidate:RTCIceCandidateInit){
        this.clientSocket.emit(SocketEvents.AVAILABLE_CANDIDIATE , {
            roomId,
            iceCandidate
        })  
    }
    public sendOfferToAnotherUser(offer:RTCSessionDescriptionInit , roomId: string) {
        console.log("hey i am sending the offer " , offer, roomId)
        this.clientSocket.emit(SocketEvents.CALL_USER, {
            roomId: roomId,
            offer: offer    
        })
    }

    public userDisconnected() {
        this.clientSocket.emit(SocketEvents.DISCONNECT);
    }

}
