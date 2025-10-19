import { userDevice } from "@/classes/userDevice";
import { webRTCMethods } from "@/classes/webRTC";
import { useEffect, useRef, useState } from "react";


export default function GroupVideoCallUI() { //Will make it remote peer too lately!!

    const peer = new webRTCMethods()
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null)

    const handleUserMedia = () => {}

    useEffect(() => {
        const streamStart = async () => {
            const cameraStream = new userDevice()
            const newStream:MediaStream | null = await cameraStream.handleUserVideoStream()
            setStream(newStream);

            if(videoRef.current){
                videoRef.current.srcObject = stream
            }
        }

        streamStart()

        return () => {
            stream?.getTracks().forEach((track) => track.stop())
        }
    }, [])

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
        console.log(videoRef)
    }, [stream])

    //Used to listen to certain events
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Group Video Call</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
                {/* Here the user stream feed will be displayed */}
                <video ref={videoRef} autoPlay playsInline className="w-[600px] h-[400px] bg-amber-300"></video>
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
