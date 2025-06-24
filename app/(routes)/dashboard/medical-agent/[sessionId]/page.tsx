'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { DoctorAgent } from '../../_components/DoctorAgentCard'
import { Circle, PhoneCall, PhoneOff } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Vapi from '@vapi-ai/web';
import Provider from '@/app/provider'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export type sessionDetails = {
  id: number,

  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: DoctorAgent
  createdOn: string,
 


}
type message={
  role:string,
  text:string,
}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState<sessionDetails>();
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>();
  const [currentRole, setCurrentRole] = useState<string|null>();
  const [liveTranscript, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<message[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const router=useRouter();
  


  useEffect(() => {
    sessionId && GetSessionDetails();
  }, [sessionId])
  const GetSessionDetails = async () => {
    const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
    console.log(result.data);
    setSessionDetails(result.data);

  }

  const startCall = async () => {
    if (!sessionDetails) {
      alert("Session details not loaded yet.");
      return;
    }
  
    if (!sessionDetails.selectedDoctor?.voiceId || !sessionDetails.selectedDoctor?.agentPrompt) {
      alert("Doctor configuration incomplete (missing voiceId or prompt).");
      return;
    }
    setConnecting(true);
    console.log("Using voiceId:", sessionDetails.selectedDoctor.voiceId);
    
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);
    const VapiAgentConfig={
      name: "AI Medical Doctor Voice Agent",
    firstMessage: "Hi there! I'm your AI Medical Assistant. I'm here to help you with any health questions or concerns you might have today. How are you feeling?",
    transcriber: {
      provider: "assembly-ai",
      language: "en"
    },
    voice: {
      provider: "playht",
      voiceId: sessionDetails.selectedDoctor.voiceId || "will"
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: sessionDetails.selectedDoctor.agentPrompt || "You're an AI medical assistant."
        }
      ]
    }
    }
    // Debug logs
  
   
   
     //@ts-ignore

    vapi.start(VapiAgentConfig);
    // vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!)
    vapi.on('call-start', () => {console.log('Call started')
      setLoading(false)
      setConnecting(false)
      setCallStarted(true);
  });
    vapi.on('call-end', () =>{ console.log('Call ended')
      setCallStarted(false);
  });
    vapi.on('message', (message) => {
      if (message.type === 'transcript') {
        const {role,transcriptType,transcript}=message;
        console.log(`${message.role}: ${message.transcript}`);
        if(transcriptType=="partial"){
          setLiveTranscript(transcript);
          setCurrentRole(role)

        }else if(transcriptType=="final"){
          setMessages((prev:any)=>[...prev, {role,text:transcript}]);
          setLiveTranscript("");
          setCurrentRole(null);

        }
       ;
      }
    });
    vapi.on('speech-start', () => {
      console.log('Assistant started speaking');
      setCurrentRole("assistant");
    });
    vapi.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setCurrentRole("user");
    });
    // Add error event handling
    vapi.on('error', (error) => {
      console.error('Vapi error:', error);
      alert('Vapi error: ' + (error?.message || JSON.stringify(error)));
    });

  }
  const endCall = async() => {
    setLoading(true);
    if(!vapiInstance) {
      setLoading(false);
      return;
    }
    vapiInstance.stop();
    vapiInstance.off('call-start');
    vapiInstance.off('call-end');
    vapiInstance.off('message');
    vapiInstance.off('speech-start');
    vapiInstance.off('speech-end');
    
    setCallStarted(false);
    setVapiInstance(null);
    router.replace("/dashboard");
    toast.success("Your report is generated");
    setLoading(false);
  };
  const GenerateReport=async()=>{
    const result=await axios.post("/api/medical-report",{
      messages:messages,
      sessionDetails:sessionDetails,
      sessionId:sessionId,

    })
    console.log(result.data);
    return result.data;

  }

  return (
    <div className="p-5 border rounded-3xl bg-secondary relative">
      {connecting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60">
          <Loader2 className="animate-spin text-white" size={48} />
          <span className="mt-4 text-white text-lg font-semibold">Connecting to AI Medical Voice Agent...</span>
        </div>
      )}
      <div className='flex justify-between items-center'>
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center"> <Circle className={`h-4 w-4 rounded-full ${callStarted?"bg-green-500":"bg-red-500"}`} />{callStarted ? "Connected..":"Not Connected"}</h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>
      {sessionDetails && <div className="flex items-center flex-col mt-10">
        {sessionDetails?.selectedDoctor?.image ? (
          <Image
            src={sessionDetails.selectedDoctor.image}
            alt={sessionDetails.selectedDoctor.specialist || "Doctor"}
            width={120}
            height={120}
            className="h-[100px] w-[100px] object-cover rounded-full"
          />
        ) : (
          <div className="h-[100px] w-[100px] bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <h2 className="mt-2 text-lg">{sessionDetails?.selectedDoctor?.specialist}</h2>
        <p className="text-sm text-gray-400">AI Medical Voice Agent</p>
        <div className="mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72">
          {messages?.slice(-4).map((message,index)=>(
           
               <h2 className="text-gray-400 p-2" key={index}>{message.role}:{message.text}</h2>
             
          ))}
         
          {liveTranscript && liveTranscript?.length>0 &&<h2 className="text-lg">{currentRole}:{liveTranscript}</h2>}

        </div>
        {!callStarted ?<Button className="mt-20" onClick={startCall} disabled={loading}>
          {loading ?<Loader2 className="animate-spin" />:<PhoneCall />}Start Call
        </Button>
        :<Button onClick={endCall} variant={"destructive"} disabled={loading}>
          {loading ?<Loader2 className="animate-spin" />:<PhoneOff />}Disconnect
        </Button>}


      </div>
      }


    </div>
  )
}

export default MedicalVoiceAgent
