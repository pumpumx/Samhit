import { create } from 'zustand'
import { useSocket } from './socket.store'

interface peerInterface {
    createOffer: (peer:RTCPeerConnection | null) => Promise<RTCSessionDescriptionInit | null | undefined>,
    createAnswer: (offer: RTCSessionDescriptionInit , peer:RTCPeerConnection | null) => Promise<RTCSessionDescriptionInit | null | undefined>
}


export const usePeer = create<peerInterface>((set, get) => ({
    createOffer: async (peer:RTCPeerConnection | null) => {
        try {
            const offer = await peer?.createOffer()
            await peer?.setLocalDescription(offer)
            return offer
        } catch (error) {
            console.log("error at create error", error)
            return null
        }
    },
    createAnswer: async (offer: RTCSessionDescriptionInit , peer:RTCPeerConnection | null) => {
        try {
            await peer?.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await peer?.createAnswer();
            await peer?.setLocalDescription(answer)
            return answer
        } catch (error) {
            console.log("error while creating rtc answer", error)
            return null
        }
    }
}))