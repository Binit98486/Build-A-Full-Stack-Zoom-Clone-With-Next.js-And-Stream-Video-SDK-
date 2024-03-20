"use client";

import AudioVolumeIndicator from "@/components/AudioVolumeIndicator";
import Button, { buttonClassname } from "@/components/Button";
import FlexiableCallLayout from "@/components/FlexiableCallLayout";
import PermissionPrompt from "@/components/PermissionPrompt";
import useLoadCall from "@/hooks/useLoadCall";
import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs";
import {
  CallControls,
  CallingState,
  DeviceSettings,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  VideoPreview,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {  useEffect, useState } from "react";

interface MeetingProps {
  id: string;
}

export default function MeetingPage({ id }: MeetingProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const { call, callloading } = useLoadCall(id);
console.log(userLoaded,callloading);

  if (!userLoaded || callloading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }
  if (!call) {
    return <p className="text-center font-bold">Call not found </p>;
  }
  const notAllowedToJoin =
    call.type == "Private-meeting" &&
    (!user || !call.state.members.find((m) => m.user.id == user.id));
  if (notAllowedToJoin) {
    return (
      <p className="text-center font-bold"> You are not allowed to join</p>
    );
  }

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <MeetingScreen />
      </StreamTheme>
    </StreamCall>
  );
}
function MeetingScreen() {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const call = useStreamCall();
  const callEndAt = useCallEndedAt();
  const callStartAt = useCallStartsAt();
  const [setupComplete, setSetupComplete] = useState<boolean>(false);
  async function handleSetupComplete() {
    call.join()
    setSetupComplete(true)
    
  }
  const callIsInFuture = callStartAt && new Date(callStartAt) > new Date();
  const callHasEnded = !!callEndAt;
  if (callHasEnded) {
    return <MeetingEndedScreen />;
  }
  if (callIsInFuture) {
    return <UpcomingMeetingScreen />;
  }
  const description = call.state.custom.description;
  return (
    <div className="space-y-6">
      {description && (
        <p className="text-center">
          Meeting description: <span className="font-bold">{description} </span>
        </p>
      )}
      {setupComplete?(
        <SpeakerLayout/>
      ):(<SetUpUI onSetupComplete={handleSetupComplete}/>)}
    </div>
  );
}

interface SetUpUIProps {
  onSetupComplete: () => void;
}
function SetUpUI({ onSetupComplete }: SetUpUIProps) {
  const call = useStreamCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const micState = useMicrophoneState();
  const camState = useCameraState();
  const [micCamDisabled,setMicCamDisabled]=useState<boolean>(false)
  useEffect(()=>{
    if(micCamDisabled){
      call.camera.disable()
      call.microphone.disable()
    }else{
      call.camera.enable()
      call.microphone.enable()
    }
  },[micCamDisabled,call])
  if (!micState.hasBrowserPermission || !camState.hasBrowserPermission) {
   return <PermissionPrompt />;
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="items-center text-2xl font-bold">Setup</div>
      <VideoPreview/>
      <div className="flex h-16 items-center gap-3">
        <AudioVolumeIndicator/>
        <DeviceSettings/>
      </div>
      <label className="flex items-center gap-2 font-medium">
<input type="checkbox" checked={micCamDisabled}
onChange={(e)=>{setMicCamDisabled(e.target.checked)}}
/>
Join with mic & camera off

      </label>
      <Button onClick={onSetupComplete}>Join meeting</Button>
    </div>
  );
}
function CallUi(){
  const {useCallCallingState}=useCallStateHooks()
  const callingState= useCallCallingState()
  if(callingState!= CallingState.JOINED){
    return <Loader2  className="animate-spin mx-auto"/>
  }
  return <FlexiableCallLayout/>
   
}

function UpcomingMeetingScreen() {
  const call = useStreamCall();
  return (
    <div className="flex flex-col items-center gap-6">
      <p>
        This meeting has not started at{" "}
        <span className="font-bold">
          {call.state.startsAt?.toLocaleString()}
        </span>
      </p>
      <p>
        Description:{" "}
        <span className="font-bold">{call.state.custom.description}</span>
      </p>
      <Link href={"/"} className={buttonClassname}>
        Go home
      </Link>
    </div>
  );
}
function MeetingEndedScreen() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-bold">This meeting has ended.</p>
      <Link href={"/"} className={buttonClassname}>
        Go home
      </Link>
    </div>
  );
}
