


export class webRTC{

    public peer:RTCPeerConnection
    private offer:RTCSessionDescriptionInit | null
    private answer:RTCSessionDescriptionInit | null

    constructor(){
        this.peer = new RTCPeerConnection();
        this.offer = null
        this.answer = null
    }

    private async createOffer(){
            this.offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(this.offer)
             //Instead of return , after creating an offer i can simply signal it to all other in the room.
    }

    private async createAnswer(offer:RTCSessionDescriptionInit){
            await this.peer?.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await this.peer?.createAnswer();
            await this.peer?.setLocalDescription(answer)
             //Instead of returning the answer , same i can signal it to the other person        
    }

    private async setAnswer(answer:RTCSessionDescriptionInit){
        this.answer = answer;
        await this.peer?.setRemoteDescription(answer);
    }
}