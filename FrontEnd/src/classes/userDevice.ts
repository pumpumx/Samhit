
export class userDevice {

    private stream: MediaStream | null

     constructor() {
        this.stream = null
        this.handleUserVideoStream()
    }

    private async handleUserVideoStream(){
        this.stream = await this.useCamera()
    }

    private async getDevices(type: string) {
        return (await navigator.mediaDevices.enumerateDevices()).filter(devices => devices.kind === type);
    }

    private async openCamera(cameraId: string, minHeight: ConstrainULong, minWidth: ConstrainULong) {
        return await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                deviceId: cameraId,
                width: minWidth,
                height: minHeight
            }
        })}

    private async useCamera() {
         const devices: MediaDeviceInfo[] = await this.getDevices('videoinput');
         if (devices && devices.length > 0) {
             const stream = await this.openCamera(devices[0].deviceId, 720, 720)
             return stream;
         }
         return null;
    }
}