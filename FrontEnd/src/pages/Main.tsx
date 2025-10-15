import { userStore, useUserProfile } from "@/stores/user.store";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";


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
//if(!camState){
//         stopVideoCam()
//     }
// }

export default function GroupVideoCallUI() {

        //Used to listen to certain events
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">Group Video Call</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Here the user stream feed will be displayed */}
            </div>

            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-8 py-4 shadow-xl flex gap-6 items-center">
                <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition">
                    <span className="material-icons">End Call</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons">mic</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                {/* Used to disable videoCall */}
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition">
                    <span className="material-icons">ScreenShare</span>
                </button>
            </div>
        </div>
    );
}
