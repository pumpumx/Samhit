import { userDevice } from "@/classes/userDevice";
import { webRTCMethods } from "@/classes/webRTC";
import { userStore, useUserProfile } from "@/stores/user.store";
import { useEffect, useRef, useState } from "react";


export function useLocalPeer() {

    const clientSocket = userStore((state) => state.clientSocket)
    const setLocalPeer = userStore((state) => state.setLocalPeer) //I dont even think that i would need a peer but it's fine guess i'll remove it later on.
    const userRoomId = useUserProfile((state) => state.userRoomId)
    const peer = userStore((state) => state.localPeer)

    useEffect(() => {

        let isMounted = true //Help's inorder to avoid multiple offers being sent
        const peerMethods = async () => {
            const peerHandler = new webRTCMethods()
            setLocalPeer(peerHandler.peer)
            console.log("Creating offer....")
            

            const offer = await peerHandler.createOfferForReciever()
            if(!isMounted) return;
            console.log("User offer", offer)
            console.log("offer Created...")
            clientSocket?.sendOfferToAnotherUser(offer, userRoomId)
        }

        peerMethods()

        return ()=>{
            isMounted = false
        }
    }, [userRoomId])

    return peer;
}

export default function GroupVideoCallUI() { //Will make it remote peer too lately!!

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteStreamRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null)
    const peer = useLocalPeer() //Responsible for managing the peer setting 

    //UseEffect for remoteStreams 

    useEffect(() => {
        if (peer) {
            peer.ontrack = (event:RTCTrackEvent) => {
                if(remoteStreamRef && remoteStreamRef.current)
                remoteStreamRef.current.srcObject = event.streams[0]
            }
        }

        return ()=>{
            peer?.close()
        }
    },[peer])

    useEffect(() => {
        const streamStart = async () => {
            const cameraStream = new userDevice()
            const newStream: MediaStream | null = await cameraStream.handleUserVideoStream()
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = newStream
            }

            setStream(newStream)
        }

        streamStart()

        return () => {
            stream?.getTracks().forEach((track) => track.stop())
        }
    }, [])

    useEffect(() => {
        if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach((track)=>{
                peer?.addTrack(track, stream)
            })
        }
        console.log(localVideoRef)
    }, [stream])

    //Used to listen to certain events
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Group Video Call</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
                {/* Here the user stream feed will be displayed */}
                <video ref={localVideoRef} autoPlay playsInline className="w-[600px] h-[400px] bg-green-400 "></video> {/* Local Stream */}
                <video ref={remoteStreamRef} autoPlay playsInline className="w-[600px] h-[400px] bg-amber-300 "></video> {/* Remote stream */}
            </div>

            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-8 py-4 shadow-xl flex gap-6 items-center">
                <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition">
                    <span className="material-icons">End Call</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons">mic</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    {/* Used to disable videoCall */}Stop Camera
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons">ScreenShare</span>
                </button>
            </div>
        </div>
    );
}
