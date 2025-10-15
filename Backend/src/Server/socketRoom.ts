import { socketUser } from "./socketUser.ts";

export class Room{
    private userMap : Map<string,socketUser> = new Map();
    public roomId:string 
    constructor(roomId:string){
        this.roomId = roomId
    }


    addUser(user:socketUser){
        this.userMap.set(user.username , user);
    }

    removeUser(username:string){
        this.userMap.delete(username);
    }

    getUser(){
        return Array.from(this.userMap.values());
    }

    getSocketIds(){
        return Array.from(this.userMap.values()).map(user => user.socketId);
    }

}