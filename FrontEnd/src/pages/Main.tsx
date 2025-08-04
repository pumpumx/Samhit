import { userStore, useUserProfile } from "@/stores/user.store";
import { useCallback, useEffect, useRef, useState,  type RefObject } from "react";
import { useSocket } from "@/stores/socket.store";
import { usePeer } from "@/stores/peer.store";

interface callData{
    fromEmail:string,
    offer:RTCSessionDescriptionInit
}
interface answerData{
    answerSenderEmail:string,
    answer:RTCSessionDescriptionInit
}
async function openUserMic(value: boolean) {
    try {
        const constraints = {
            'audio': value
        }
        return navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
        console.log("Error at audio", error)
    }
}

async function openUserVideoCam(cameraId: string, minWidth: ConstrainULong, minHeight: ConstrainULong) {
    try {
        const constraints = {
            'video': {
                deviceId: cameraId,
                width: minWidth,
                height: minHeight
            }
        }
        return navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
        console.log("Error at videocam", error)
    }
}

async function stopVideoCam(videoRef: RefObject<HTMLVideoElement | null>) {

    // const device = await navigator.mediaDevices.getUserMedia({
    //     'video':false
    // })
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
}

async function getUserDevices(type: string) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === type)
}

async function openCamera() {
    const userDevices: MediaDeviceInfo[] = await getUserDevices('videoinput')
    console.log("devices", userDevices)
    if (userDevices && userDevices.length > 0) {
        return openUserVideoCam(userDevices[0].deviceId, 720, 720)
    }
    return null
}

// async function camStateFunc(camState:boolean , vidoe){
//     if(!camState){
//         stopVideoCam()
//     }
// }

export default function GroupVideoCallUI() {

    const socket = useSocket((state)=>state.clientSocket)
    const peer = usePeer()

    const userArray = userStore((state) => state.Users)
    const username = useUserProfile((state)=>state.username)
    const [streamVid, setStream] = useState<MediaStream | null>(null)
    const [camState, setCamState] = useState<boolean>(true);
    const vidRef = useRef<HTMLVideoElement | null>(null)

    const handleOffer = useCallback(async() => {
        const offer = await usePeer.getState().createOffer()
        socket?.emit('call-user',{username,offer})
        console.log('incoming call',offer)
    },[socket])

    
    const handleIncomingCall = useCallback(async (data:callData)=>{ //If you want to decline the answer -> two options either cut the call like send a false flag and don't create an answer at all or don't let user join the room until unless authorized
        const { fromEmail , offer} = data
        const answer = await usePeer.getState().createAnswer(offer) 
        console.log("answer",answer)
        socket?.emit('send-answer',{fromEmail , answer})
    },[])

    const recieveAnswer = useCallback(async(data:answerData)=>{ //Responsible for recieving the answer to initiate the rtc procedure
        const { answerSenderEmail , answer}=data
        const peer = usePeer.getState().peer
        console.log("answer recieved",answer)
        await peer.setRemoteDescription(answer)
    },[])

    
    useEffect(() => {
        console.log(userArray)
        const streamSet = async () => {
            const stream = await openCamera()

            if (vidRef.current && stream) {
                vidRef.current.srcObject = stream
            }
        }
        streamSet()
        handleOffer()
        //Used to listen to certain events
        socket?.on('incoming-call',handleIncomingCall)
        socket?.on('recieve-answer',recieveAnswer)
        return () => {
            if (streamVid) {
                console.log(streamVid.getTracks())
                streamVid.getTracks().forEach((track) => track.stop())
            }
            socket?.off('incoming-call',handleIncomingCall)
            socket?.off('recieve-answer',recieveAnswer)
        }
    }, [setCamState])
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Group Video Call</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userArray.map((user) => (
                    <div
                        key={user.id}
                        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden flex flex-col items-center justify-center h-60 transition hover:scale-105 duration-300 border border-white/20"
                    >
                        <div className="w-full h-40 bg-white/10 flex items-center justify-center">
                            <span className="text-gray-200 font-medium text-sm">{user.username}'s Video
                                {/*User Video stream would render here */}
                                <video autoPlay playsInline muted ref={vidRef} className="z-0"> </video>
                            </span>
                        </div>
                        <p className="text-base font-semibold mt-2">{user.username}</p>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-8 py-4 shadow-xl flex gap-6 items-center">
                <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition">
                    <span className="material-icons">call_end</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons">mic</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons" onClick={() => stopVideoCam(vidRef)}>videocam</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons">screenShare</span>
                </button>
            </div>
        </div>
    );
}
