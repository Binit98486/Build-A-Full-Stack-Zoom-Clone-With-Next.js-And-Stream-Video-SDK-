"use client";

import { useUser } from "@clerk/nextjs";
import { Call, MemberRequest, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { act } from "react-dom/test-utils";
import getUserIds from "./actions";
import { log } from "console";
import Button from "@/components/Button";
import Link from "next/link";

export default function CreateMeetingPage() {
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [startTimeInput, setStartTimeInput] = useState<string>("");
  const [participateInput, setParticipateInput] = useState<string>("");
  const [call, setCall] = useState<Call>();
  const { user } = useUser();

  const client = useStreamVideoClient();
  async function CreateMeeting() {
    if (!client || !user) {
      return;
    }
    try {
      const id = crypto.randomUUID();
      const callType = participateInput ? "Private-meeting" : "default";
      const call = client.call(callType, id);
      const memberEmails = participateInput
        .split(",")
        .map((email) => email.trim());
        const memberIds =  await getUserIds(memberEmails)
        console.log(memberIds);
        
        const members:MemberRequest[]=memberIds.map(id=>({
          user_id:id,
          role:"call_member"
        }))
        .concat({user_id:user.id,role:"call_member"})
        .filter((v,i,a)=>a.findIndex((v2)=>v2.user_id===v.user_id)===i)
        const starts_at = new Date(startTimeInput || Date.now()).toISOString()

      await call.getOrCreate({
        data: {
          starts_at,
          members,
          custom: {
   
            description: descriptionInput,
          },
        },
      });
      setCall(call);
    } catch (error) {
      console.error(error);
      alert("Something went wrong please try  again later");
    }
  }

  if (!user) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <h1 className="text-center text-2xl font-bold">
        Welcome {user.username}
      </h1>
      <div className="mx-auto w-80 space-y-6 rounded-md bg-slate-100 p-6">
        <h1 className="text-center text-xl font-bold ">
          {" "}
          Create a new meeting
        </h1>
        <DescriptionInput
          value={descriptionInput}
          onChange={setDescriptionInput}
        />
        <StartTimeInput value={startTimeInput} onChange={setStartTimeInput} />
        <ParticipateInput
          value={participateInput}
          onChange={setParticipateInput}
        />
        <Button
          onClick={CreateMeeting}
          className="w-full   rounded-xl border-2 bg-indigo-600 p-2 text-white "
        >
          Create meeting
        </Button>
      </div>
      {call && <MeetingLink call={call} />}
    </div>
  );
}
interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  const [active, setActive] = useState<boolean>(false);
  return (
    <div className="space-y-2">
      <div className="font-medium">Meeting info:</div>

      <label className="flex items-center gap-1.5">
        <input
          className=""
          type="checkbox"
          checked={active}
          onChange={(e: any) => {
            setActive(e.target.value);
            onChange("");
          }}
        />
        Add Description
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Description</span>
          <textarea
            value={value}
            className="border-slae-400  w-full rounded-md border p-2"
            onChange={(e: any) => onChange(e.target.value)}
            maxLength={500}
          />
        </label>
      )}
    </div>
  );
}
interface StartTimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

function StartTimeInput({ value, onChange }: StartTimeInputProps) {
  const [active, setActive] = useState<boolean>(false);
  const dateTimeLocalNow = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
  return (
    <div className="space-y-2">
      <div className="font-medium">Meeting Start </div>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Start meeting immediately
      </label>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={active}
          onChange={() => {
            setActive(true);
            onChange(dateTimeLocalNow);
          }}
        />
        Start meeting at date/time
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Start time</span>
          <input
            type="datetime-local"
            value={value}
            className="w-full  rounded-md border border-gray-400 p-2"
            onChange={(e: any) => onChange(e.target.value)}
            maxLength={500}
            min={dateTimeLocalNow}
          />
        </label>
      )}
    </div>
  );
}

interface ParticipateInputProps {
  value: string;
  onChange: (value: string) => void;
}
function ParticipateInput({ value, onChange }: ParticipateInputProps) {
  const [active, setActive] = useState<boolean>(false);
  const dateTimeLocalNow = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
  return (
    <div className="space-y-2">
      <div className="font-medium">Participats: </div>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Everyone with link can join
      </label>
      <label className="flex items-center gap-1.5">
        <input
          type="radio"
          checked={active}
          onChange={() => {
            setActive(true);
          }}
        />
        Private meeting
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Participant emails</span>
          <textarea
            value={value}
            className="w-full  rounded-md border border-gray-400 p-2"
            onChange={(e: any) => onChange(e.target.value)}
            maxLength={500}
            placeholder="Enter Participant emails address separated by comma"
          />
        </label>
      )}
    </div>
  );
}

interface MeetingLinkProps {
  call: Call;
}
function MeetingLink({ call }: MeetingLinkProps) {
  const meetinglink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call.id}`;
  return <div className="items-center flex flex-col text-center gap-3">
    
    <div className="flex  items-center gap-3">
      <span>
        Invitation Link :
        <Link target="_blank" href={meetinglink} className="font-medium">{meetinglink}</Link>
      </span>
      <button title="Copy meeting link" onClick={()=>{
        navigator.clipboard.writeText(meetinglink)
      }}>

        <Copy/>
      </button>

    </div>
    <a className="text-blue-500 hover:underline" target="_blank" href={getMailToLink(meetinglink,call.state.startsAt,call.state.custom.description)}>
      Send email invitation
    </a>
    </div>;
}


function getMailToLink(
  meetinglink:string,
  startsAt?:Date,
  description?:string
){
  const startDateFormatted=startsAt?startsAt.toLocaleString("en-US",{
    dateStyle:"full",
    timeStyle:"short"
  }):undefined

  const subject = "Join my meeting"+(startDateFormatted?` at ${ startDateFormatted}`:"")
  const body = `Join my meeting at ${meetinglink}.`+(startDateFormatted?`\n\n The meeting starts at ${startDateFormatted}.`:"")+(description?`\n\nDescription: ${description}`:"")
  return `mailto: ?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body )}`
}