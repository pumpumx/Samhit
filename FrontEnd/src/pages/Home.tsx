import { useEffect, useRef} from "react";
import { userStore, useUserProfile } from "@/stores/user.store";
import { useNavigate } from "react-router-dom";
import { clientSocketMethods } from "@/classes/webRTC";


export default function HomePage() {

  const cardRef = useRef(null)
  const clientSocket = useRef<clientSocketMethods | null>(null)
  const setClientSocketGlobal = userStore((state) => state.setUserClientSocket);
  const username = useUserProfile((state) => state.username)
  const userRoomId = useUserProfile((state) => state.userRoomId)
  const setRoomId = useUserProfile((state)=>state.setRoomId)
  const changeUsername = useUserProfile((state) => state.setUsername)  //later on can apply bloom filter to check for the possibility of a preexisting username 
  const navigate = useNavigate()
  
  useEffect(()=>{
    if(!clientSocket.current){
      clientSocket.current = clientSocketMethods.getInstance()
      setClientSocketGlobal(clientSocket.current)    
      console.log(clientSocket)
    }
  },[])

  const userJoinedRoom = () => {
    console.log("inside")
    clientSocket.current?.sendClientInfoToBackend({ username: username, roomId: userRoomId }) //send the user room Id back to the backend
     navigate(`/room/${userRoomId}`)
  }
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
              value={username}
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
              onChange={(e) => setRoomId(e.target.value)}
              value={userRoomId}
              id="room"
              type="text"
              placeholder="Enter room ID"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={()=>userJoinedRoom()}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
