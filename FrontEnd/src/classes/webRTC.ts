
import { SocketEvents } from "@/constants/socketEvents";
import { io, type Socket } from "socket.io-client";




export class webRTCMethods {
    public peer: RTCPeerConnection
    protected isPolite:boolean
    protected offer: Promise<RTCSessionDescriptionInit>
    // protected answer: Promise<RTCSessionDescriptionInit>

    constructor() {
        this.peer = new RTCPeerConnection();
        this.isPolite = false;
        this.offer = this.createOfferForReciever();
    }

    protected async createOfferForReciever():Promise<RTCSessionDescriptionInit>{
        const offer = await this.peer.createOffer()
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    protected async createAnswerForInitiator(offer: RTCSessionDescriptionInit) {
        await this.peer?.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peer?.createAnswer();
        await this.peer?.setLocalDescription(answer)
        //signal the answer to the other person        
        
    }

    protected async setOfferRecievedFromAnotherUser(offer:RTCSessionDescriptionInit){
        await this.peer.setRemoteDescription(offer);
        this.createAnswerForInitiator(offer);
    }

    protected async setAnswerRecievedFromInitiator(answer: RTCSessionDescriptionInit) {
        await this.peer?.setRemoteDescription(answer);
    }

    protected async setICECandidate(iceCandidate:RTCIceCandidateInit){
        await this.peer.addIceCandidate(iceCandidate)
    }
}


export class clientSocketMethods extends webRTCMethods {

    public clientSocket: Socket

    constructor() {
        super()
        const webSocketUrl = process.env.BACKEND_URL;
        const socket = io(webSocketUrl);
        this.clientSocket = socket
        this.SocketHandler()
    }

    //Listening Events

    private SocketHandler(){
        this.clientSocket.on(SocketEvents.RECIEVE_ANSWER , (data:{answer:RTCSessionDescriptionInit})=>{
            this.setAnswerRecievedFromInitiator(data.answer);
        })

        this.clientSocket.on(SocketEvents.INCOMING_CALL , (data:{offer:RTCSessionDescriptionInit})=>{
            this.setOfferRecievedFromAnotherUser(data.offer);
        })

        this.clientSocket.on(SocketEvents.AVAILABLE_CANDIDIATE , (data:{iceCandidate:RTCIceCandidateInit})=>{
            this.setICECandidate(data.iceCandidate) ;
        })

        this.clientSocket.on(SocketEvents.DISCONNECT , this.userDisconnected)
    }

    //Sending events
    private sendClientInfoToBackend(data:{username:string , roomId:string}){
        this.clientSocket.emit(SocketEvents.SEND_USER_INFO , {
            username:data.username,
            
            roomId:data.roomId
        });
    }

    private sendAnswerToAnotherUser(roomId:string){
        this.clientSocket.emit(SocketEvents.SEND_ANSWER)
    }

    private sendOfferToAnotherUser(roomId : string){
        this.clientSocket.emit(SocketEvents.SEND_OFFER ,{
            roomId:roomId,
            offer:this.offer
        })
    }
    
    private userDisconnected(){
        this.clientSocket.emit(SocketEvents.DISCONNECT);
    }

}
