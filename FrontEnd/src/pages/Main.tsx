import { userStore } from "@/stores/user.store";
import { useEffect, useRef, useState, type Key, type RefObject } from "react";


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

    const userArray = userStore((state)=>state.Users)

    const [streamVid, setStream] = useState<MediaStream | null>(null)
    const [camState , setCamState] = useState<boolean>(true);
    const vidRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        console.log(userArray)
        const streamSet = async () => {
            const stream = await openCamera()

            if (vidRef.current && stream) {
                vidRef.current.srcObject = stream
            }
        }
        streamSet()
        return () => {
            if (streamVid) {
                console.log(streamVid.getTracks())
                streamVid.getTracks().forEach((track) => track.stop())
            }
        }
    }, [setCamState])
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Group Video Call</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userArray.map((user , index) => (
                    <div
                        key={user.id }
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
