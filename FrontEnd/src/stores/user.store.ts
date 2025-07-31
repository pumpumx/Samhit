import {create} from 'zustand'

export interface userData{
    Users:{id:string ,username:string , roomId:string}[];
    insertUserIntoUserList:(id:string , username:string , roomId:string)=>void,
    removeUser:()=>void;
    isUserAvailable?:()=>void
}


export const userStore = create<userData>((set)=>({
    Users:[],
    insertUserIntoUserList:(id:string , username:string , roomId:string)=>{
        set((state)=>({
            Users:[...state.Users , {id ,username , roomId}]
        }))
    },
    removeUser:()=>{

    }
}))