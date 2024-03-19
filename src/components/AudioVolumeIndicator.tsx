import { Icon, createSoundDetector, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useDebugValue, useEffect, useState } from "react";

export default function AudioVolumeIndicator() {
  const { useMicrophoneState } = useCallStateHooks();
  const { isEnabled, mediaStream } = useMicrophoneState();
  const [audioLevel, setAudiLevel] = useState(0);

  useEffect(() => {
    if (!isEnabled || !mediaStream) return;
    const disposeSoundDetector= createSoundDetector(
          mediaStream,({audioLevel:al})=>setAudiLevel(al),
          {
                    detectionFrequencyInMs:80,destroyStreamOnStop:false
          }
    )
    return()=>{
          disposeSoundDetector().catch(console.error)
    }
}, []);
if(!isEnabled) return null


return <div className="flex w-72 items-center gap-3 rounded-md bg-slate-900 p-4">
          <Icon icon="mic"/>
          <div className="h-1.5 flex-1 rounded-md bg-white">
                    <div className="w-full h-full origin-left  bg-slate-500" style={{ transform:`scaleX(${audioLevel/100})`}}/>
          </div>
</div>
}
