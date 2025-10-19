
export class userDevice {

    stream: MediaStream | null

    constructor() {
        this.stream = null
    }

    async handleUserVideoStream() {
        if(!this.stream){
            this.stream = await this.useCamera()
            return this.stream
        }
        this.stream
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
        })
    }

    async useCamera():Promise<MediaStream | null>{
        const devices: MediaDeviceInfo[] = await this.getDevices('videoinput');
        if (devices && devices.length > 0) {
            const stream = await this.openCamera(devices[0].deviceId, 720, 720)
            return stream;
        }
        return null;
    }
}