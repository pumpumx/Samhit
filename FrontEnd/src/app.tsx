import {  useEffect, useRef, useState } from "react";



async function getDevices(type:string){
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter(devices=>devices.kind === type)

 }

async function openCamera(cameraId:string,minHeight:ConstrainULong,minWidth:ConstrainULong){

    const connection = await navigator.mediaDevices.getUserMedia({
        // audio:true,
        video:{
            deviceId:cameraId,
            width:minWidth,
            height:minHeight
        }
    })

    return connection;
 }


async function useCamera(){
    const devices:MediaDeviceInfo[] = await getDevices('videoinput');

    if(devices && devices.length > 0 ){
        const stream = await openCamera(devices[0].deviceId ,720,720)
        return stream;
    }

    return null;
    
 }


 async function signalIce(){
    const configs =  {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    const peerConnection = new RTCPeerConnection(configs)
 }
export default function MainApp(){

    const [streamVid , setStream] = useState<MediaStream | null>(null)
    const vidRef = useRef<HTMLVideoElement | null>(null)

    useEffect(()=>{
        const streamSet = async ()=> {
        const stream = await useCamera()
      
        if(vidRef.current && stream){
            vidRef.current.srcObject = stream
        }
        setStream(stream)
    }
    streamSet()
        return ()=>{
            if(streamVid){
            console.log(streamVid.getTracks())
            streamVid.getTracks().forEach((track)=>track.stop())
        }
        }
    },[])

    
    return(
        <>
            <div className="">
                <video  ref={vidRef} autoPlay playsInline controls={false}></video>
            </div>
        </>
    )
}