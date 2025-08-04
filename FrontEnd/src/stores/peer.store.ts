import {create} from 'zustand'

interface peerInterface{
    peer:RTCPeerConnection,
    createOffer:()=>Promise<RTCSessionDescriptionInit | null>,
    createAnswer:(offer:RTCSessionDescriptionInit)=>Promise<RTCSessionDescriptionInit | null>
}


export const usePeer = create<peerInterface>((set,get)=>({
    peer:new RTCPeerConnection({iceServers:[{'urls': 'stun:stun.l.google.com:19302'}]}),
    createOffer:async ()=>{
        try {
            const peer = get().peer
            const offer = await peer.createOffer() 
            await peer.setLocalDescription(offer)
            console.log("gettng peer " , offer)
            return offer
        } catch (error) {
            console.log("error at create error" , error)
            return null
        }
    },
    createAnswer:async (offer:RTCSessionDescriptionInit)=>{
        try {
            const peer = get().peer
            await peer.setRemoteDescription(offer)
            const answer = await peer.createAnswer()
            await peer.setLocalDescription(answer)
            return answer
        } catch (error) {
            console.log("error while creating rtc answer",error)
            return null
        }
    }

}))