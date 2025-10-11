


export class socketUser{
    public username:string 
    public socketId:string  
    public roomId:string 
    constructor(username:string , socketId:string , roomId:string){
        this.username = username,
        this.socketId = socketId,
        this.roomId = roomId
    }
};