import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { userStore, useUserProfile } from "@/stores/user.store";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/stores/socket.store";

const uniqueIdGenerator = (): string => {

  const randomId: string | undefined = Math.floor(Math.random() * 1e9) + 1 as unknown as string

  if (randomId) return randomId                                                       
  return " "
}
export default function HomePage() {
  const cardRef = useRef(null);
  const username = useUserProfile((state)=>state.username)
  const changeUsername = useUserProfile((state)=>state.setUsername)  //later on can apply bloom filter to check for the possibility of a preexisting username 
  const [roomId, setRoomID] = useState<string | undefined>()
  const addUser = userStore((state) => state.insertUserIntoUserList)
  const navigate = useNavigate()

  const socket = useSocket((state)=>state.clientSocket)
  const createSocket = useSocket((state)=>state.initiateSocketConnection)
  const onValidJoinIntoTheRoom = () => { //Validate if user is trying to enter an unauthorized room !! in future , for the time being just redirect and add it into global user array
    try {
      console.log("in valid join room")
      socket?.emit('send-user-info',{username , roomId})

      if (username && roomId) {
        const uniqueId = uniqueIdGenerator()
        console.log(uniqueId)
        addUser(uniqueId, username, roomId)
        navigate(`/room/${roomId}`)
      }
    } catch (error) {
      console.log("error at onValidJoinIntoTheRoom function",error)
    }
  }

  
  useEffect(() => {
    createSocket()
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    return ()=>{
      
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center px-4">
      <div
        ref={cardRef}
        className="w-full max-w-md shadow-2xl rounded-2xl p-6 bg-white"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Join a Room
        </h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              onChange={(e) => changeUsername(e.target.value)}
              value={username as string}
              id="email"
              type="text"
              placeholder="Enter your username"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700">
              Room ID
            </label>
            <input
              onChange={(e) => setRoomID(e.target.value)}
              value={roomId as string}
              id="room"
              type="text"
              placeholder="Enter room ID"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onValidJoinIntoTheRoom()
            }}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
