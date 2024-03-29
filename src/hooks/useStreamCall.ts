import { useCall } from "@stream-io/video-react-sdk";

export default function useStreamCall(){
          const call  = useCall()
          
          if(!call){
                    throw new Error(
                              "useStreamCall must be within streamcall  component with a valid call props."
                    )
          }
          return call
}