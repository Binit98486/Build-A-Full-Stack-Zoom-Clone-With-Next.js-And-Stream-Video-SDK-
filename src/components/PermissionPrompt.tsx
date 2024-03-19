import { Mic, Webcam } from "lucide-react";

export default function PermissionPrompt(){
          return <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                              <Webcam size={40}/>
                              <Mic size={40}/>
                              <p className="text-center">
                                        Please allow your microphone and camera to join call

                              </p>
                    </div>
          </div>
}