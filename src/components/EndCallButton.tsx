import useStreamCall from "@/hooks/useStreamCall"
import { useCallStateHooks } from "@stream-io/video-react-sdk"

export default function EndCallButton(){
          const call =  useStreamCall()
          const {useLocalParticipant}= useCallStateHooks()
          const localParticipant = useLocalParticipant()
          const participantIsChannelOwner = 
          localParticipant &&call.state.createdBy &&
          localParticipant.userId  === call.state.createdBy.id
if(!localParticipant){
          return null
}
return <button onClick={()=>call.endCall()} className="mx-auto block fon hover:underlinet-medium text-red-500">
          End call for everyone
</button>
}