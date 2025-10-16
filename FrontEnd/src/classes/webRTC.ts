
import { SocketEvents } from "@/constants/socketEvents";
import { io, type Socket } from "socket.io-client";




export class webRTCMethods {
    public peer: RTCPeerConnection
    protected isPolite: boolean
    protected offer: Promise<RTCSessionDescriptionInit>
    // protected answer: Promise<RTCSessionDescriptionInit>

    constructor() {
        this.peer = new RTCPeerConnection();
        this.isPolite = false;
        this.offer = this.createOfferForReciever();
    }

    async createOfferForReciever(): Promise<RTCSessionDescriptionInit> {
        const offer = await this.peer.createOffer()
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    async createAnswerForInitiator(offer: RTCSessionDescriptionInit) {
        await this.peer?.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peer?.createAnswer();
        await this.peer?.setLocalDescription(answer)
        //signal the answer to the other person        

    }

    async setOfferRecievedFromAnotherUser(offer: RTCSessionDescriptionInit) {
        await this.peer.setRemoteDescription(offer);
        this.createAnswerForInitiator(offer);
    }

    async setAnswerRecievedFromInitiator(answer: RTCSessionDescriptionInit) {
        await this.peer?.setRemoteDescription(answer);
    }

    async setICECandidate(iceCandidate: RTCIceCandidateInit) {
        await this.peer.addIceCandidate(iceCandidate)
    }
}


export class clientSocketMethods extends webRTCMethods {

    public clientSocket: Socket

    constructor() {
        super() 
        const webSocketUrl = import.meta.env.VITE_BACKEND_URL
        console.log(webSocketUrl)
        const socket = io(webSocketUrl);
        this.clientSocket = socket
        this.SocketHandler()
    }

    //Listening Events

    public sendClientInfoToBackend(data: { username: string, roomId: string }) {
        this.clientSocket.emit(SocketEvents.SEND_USER_INFO, {
            username: data.username,
            roomId: data.roomId
        })
    }

    public roomJoinedSuccessfully(data:{username:string , roomId:string}){
        console.log(`${data.username} joined room ${data.roomId}`)
    }

    protected sendAnswerToAnotherUser(roomId: string) {
        this.clientSocket.emit(SocketEvents.SEND_ANSWER)
    }

    protected sendOfferToAnotherUser(roomId: string) {
        this.clientSocket.emit(SocketEvents.SEND_OFFER, {
            roomId: roomId,
            offer: this.offer
        })
    }

    public userDisconnected() {
        this.clientSocket.emit(SocketEvents.DISCONNECT);
    }

    private SocketHandler() {
        this.clientSocket.on(SocketEvents.RECIEVE_ANSWER, (data: { answer: RTCSessionDescriptionInit }) => {
            this.setAnswerRecievedFromInitiator(data.answer);
        })

        this.clientSocket.on(SocketEvents.INCOMING_CALL, (data: { offer: RTCSessionDescriptionInit }) => {
            this.setOfferRecievedFromAnotherUser(data.offer);
        })

        this.clientSocket.on(SocketEvents.AVAILABLE_CANDIDIATE, (data: { iceCandidate: RTCIceCandidateInit }) => {
            this.setICECandidate(data.iceCandidate);
        })

        this.clientSocket.on(SocketEvents.DISCONNECT, ()=>this.userDisconnected())

        this.clientSocket.on(SocketEvents.USER_JOINED_ROOM , (data:{username:string , roomId:string})=>{
            this.roomJoinedSuccessfully({username:data.username , roomId:data.roomId});
        })
    }

    //Sending events

}
