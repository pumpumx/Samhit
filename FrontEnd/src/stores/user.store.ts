import {create} from 'zustand'

export interface userData{
    Users:{id:string ,username:string , roomId:string}[];
    insertUserIntoUserList:(id:string , username:string , roomId:string)=>void,
    removeUser:()=>void;
    isUserAvailable?:()=>void,
    getUserRoom:(username : string)=>string | undefined
}


export const userStore = create<userData>((set , get)=>({
    Users:[],
    insertUserIntoUserList:(id:string , username:string , roomId:string)=>{
        set((state)=>({
            Users:[...state.Users , {id ,username , roomId}]
        }))
    },
    removeUser:()=>{

    },
    getUserRoom:(username : string)=>{ //Return a string value
        const user = get().Users.find((state)=>state.username === username);
        return user?.roomId
    }
}))


interface userProfile{ //Can scale this user profile later if we would like to add more details to the user profile
    username:string,
    setUsername:(newUsername : string)=>void
}

export const useUserProfile = create<userProfile>((set)=>({ //If the user profile is an object simple loop through to mutate the state
    username:"",
    setUsername:(newUsername:string)=>{
        set({username:newUsername})
    }
}))