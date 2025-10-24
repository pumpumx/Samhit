
import { SocketEvents } from "@/constants/socketEvents";
import { io, type Socket } from "socket.io-client";

export class webRTCMethods {
    public peer: RTCPeerConnection
    public static isPolite:boolean 
    // protected answer: Promise<RTCSessionDescriptionInit>

    public static RTCInstance: webRTCMethods

    constructor() {
        const config = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302' // Public STUN server provided by Google
                }
            ]
        }
        this.peer = new RTCPeerConnection(config)
    }

    public static getRTCInstance(): webRTCMethods {
        if (!webRTCMethods.RTCInstance) {
            webRTCMethods.RTCInstance = new webRTCMethods()
        }
        return webRTCMethods.RTCInstance
    }

    async createOfferForReciever(): Promise<RTCSessionDescriptionInit> {

        const offer = await this.peer.createOffer()
        await webRTCMethods.RTCInstance.peer.setLocalDescription(offer)
        return offer

        //This will be the first thing that would  return or be signalled to another user
    }

    async createAnswerForInitiator(roomId: string) {
        const answer = await webRTCMethods.RTCInstance.peer.createAnswer();
        await webRTCMethods.RTCInstance.peer.setLocalDescription(answer)

        console.log("remote answer created")
        // clientSocket?.sendAnswerToAnotherUser(roomId,answer)
        //signal the answer to the other person 
        const clientSocketInstance = clientSocketMethods.instance; //This is called bloody singleton pattern
        clientSocketInstance.clientSocket.emit(SocketEvents.SEND_ANSWER, {
            roomId: roomId,
            answer: answer
        })
    }
    async setOfferRecievedFromAnotherUser(roomId: string, offer: RTCSessionDescriptionInit) {
        await webRTCMethods.RTCInstance.peer.setRemoteDescription(offer);
        console.log("Offer set as localDescription")
        this.createAnswerForInitiator(roomId);
    }

    async setAnswerRecievedFromInitiator(roomId: string, answer: RTCSessionDescriptionInit) {
        //Never assume that you can set remote description immediately
        console.log(webRTCMethods.RTCInstance.peer.localDescription?.sdp)
        if (webRTCMethods.RTCInstance.peer.signalingState !== 'have-local-offer') {
            console.warn('Cannot set remote answer, peer not in have-local-offer state');
            console.log(webRTCMethods.RTCInstance.peer.signalingState)
            return;
        }

        await webRTCMethods.RTCInstance.peer.setRemoteDescription(answer);

        console.log("answer recieved", answer)
        //Find ice peers afterwards!! 
        // this.peer.onicecandidate = async (e)=>{
        //     if(e.candidate != null){    
        //         // clientSocket?.sendIceCandidateToRemote(roomId , e.candidate)
        //     }
        // }
    }

    async setICECandidate(iceCandidate: RTCIceCandidateInit) {
        await webRTCMethods.RTCInstance.peer.addIceCandidate(iceCandidate)
    }
}


export class clientSocketMethods extends webRTCMethods {

    public clientSocket: Socket

    public static instance: clientSocketMethods

    private constructor() {
        super()
        const webSocketUrl = import.meta.env.VITE_BACKEND_URL
        console.log(webSocketUrl)
        const socket = io(webSocketUrl);
        this.clientSocket = socket
        this.SocketHandler()
    }

    //Listening Events

    public static getInstance() {
        if (!clientSocketMethods.instance) {
            clientSocketMethods.instance = new clientSocketMethods()
        }
        return clientSocketMethods.instance
    }

    private SocketHandler() {
        this.clientSocket.on(SocketEvents.USER_JOINED_ROOM, (data: { username: string, roomId: string }) => {
            this.roomJoinedSuccessfully({ username: data.username, roomId: data.roomId });
        })
        this.clientSocket.on(SocketEvents.RECEIVE_ANSWER, (data: { roomId: string, answer: RTCSessionDescriptionInit }) => {
            console.log("Recieving another user answer", data.answer)
            this.setAnswerRecievedFromInitiator(data.roomId, data.answer);
        })

        this.clientSocket.on(SocketEvents.INCOMING_CALL, (data: { roomId: string, offer: RTCSessionDescriptionInit }) => {
            console.log("You are getting an offer from anothre user");
            this.setOfferRecievedFromAnotherUser(data.roomId, data.offer);
        })

        this.clientSocket.on(SocketEvents.CHECK_POLITE_RESULT , (data:{isPolite:boolean})=>{
            webRTCMethods.isPolite = data.isPolite
            console.log("isPOlite" ,  webRTCMethods.isPolite)   
        })

        this.clientSocket.on(SocketEvents.AVAILABLE_CANDIDIATE, (data: { iceCandidate: RTCIceCandidateInit }) => {
            console.log("candidates available", data.iceCandidate)
            this.setICECandidate(data.iceCandidate);
        })

        

        this.clientSocket.on(SocketEvents.DISCONNECT, () => this.userDisconnected())

    }
    //Sending events
    public sendClientInfoToBackend(data: { username: string, roomId: string }) {
        this.clientSocket.emit(SocketEvents.SEND_USER_INFO, {
            username: data.username,
            roomId: data.roomId
        })
    }

    public async isCLientPolite(roomId:string){
         this.clientSocket.emit(SocketEvents.CHECK_POLITE , {
            roomId
        })
    }

    public roomJoinedSuccessfully(data: { username: string, roomId: string }) {
        console.log(`${data.username} joined room ${data.roomId}`)
        this.isCLientPolite(data.roomId)
    }

    public sendAnswerToAnotherUser(roomId: string, answer: RTCSessionDescriptionInit) {
        this.clientSocket.emit(SocketEvents.SEND_ANSWER, {
            roomId,
            answer
        })
    }


    sendIceCandidateToRemote(roomId: string, iceCandidate: RTCIceCandidateInit) {
        this.clientSocket.emit(SocketEvents.AVAILABLE_CANDIDIATE, {
            roomId,
            iceCandidate
        })
    }
    public sendOfferToAnotherUser(offer: RTCSessionDescriptionInit, roomId: string) {
        console.log("hey i am sending the offer ", offer, roomId)
        this.clientSocket.emit(SocketEvents.CALL_USER, {
            roomId: roomId,
            offer: offer
        })
    }

    public userDisconnected() {
        this.clientSocket.emit(SocketEvents.DISCONNECT);
    }

}
