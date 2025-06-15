

export interface userSchemaType{
    fullname:string,
    username:string,
    email:string,
    age:number,
    password:string,
    role:string,
    bio:string,
    avatar?:string,
    isVerified:boolean,
    isAvailable:boolean,   
    refreshToken:string,
}