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
  report: {
    sessionId: string;
    agent: string;
    user: string;
    timestamp: string;
    chiefComplaint: string;
    summary: string;
    symptoms: string[];
    duration: string;
    severity: string;
    medicationsMentioned: string[];
    recommendations: string[];
  } | null;
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
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router=useRouter();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && sessionId) {
      GetSessionDetails();
    }
  }, [sessionId, isMounted])

  // Cleanup effect for component unmounting
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      if (vapiInstance) {
        console.log("Cleaning up Vapi instance on component unmount");
        try {
          // Try to stop the call if it's still active
          if (callStarted) {
            vapiInstance.stop().catch(error => {
              console.error("Error stopping call during unmount:", error);
            });
          }
          
          // Remove all event listeners
          vapiInstance.off('call-start');
          vapiInstance.off('call-end');
          vapiInstance.off('message');
          vapiInstance.off('speech-start');
          vapiInstance.off('speech-end');
          vapiInstance.off('error');
          
          console.log("Vapi instance cleanup completed");
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [vapiInstance, callStarted]);

  // Handle browser tab closure and page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (vapiInstance && callStarted) {
        console.log("Disconnecting call due to page unload");
        try {
          // Try to stop the call synchronously
          vapiInstance.stop().catch(error => {
            console.error("Error stopping call on page unload:", error);
          });
          
          // Remove event listeners
          vapiInstance.off('call-start');
          vapiInstance.off('call-end');
          vapiInstance.off('message');
          vapiInstance.off('speech-start');
          vapiInstance.off('speech-end');
          vapiInstance.off('error');
        } catch (error) {
          console.error("Error during page unload cleanup:", error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [vapiInstance, callStarted]);

  const GetSessionDetails = async () => {
    try {
      const result = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      console.log("Raw session data:", result.data);
      
      // Validate the session data structure
      if (!result.data) {
        console.error("No session data received");
        alert("Failed to load session data. Please try again.");
        return;
      }
      
      if (!result.data.selectedDoctor) {
        console.error("No selectedDoctor in session data");
        alert("Session data is incomplete. Please create a new session.");
        return;
      }
      
      // Log the doctor data structure
      console.log("Selected doctor data:", result.data.selectedDoctor);
      console.log("Doctor voiceId:", result.data.selectedDoctor.voiceId);
      console.log("Doctor agentPrompt:", result.data.selectedDoctor.agentPrompt);
      console.log("Doctor specialist:", result.data.selectedDoctor.specialist);
      
      setSessionDetails(result.data);
    } catch (error) {
      console.error("Error fetching session details:", error);
      alert("Failed to load session. Please try again.");
    }
  }

  const startCall = async () => {
    if (!sessionDetails) {
      alert("Session details not loaded yet.");
      return;
    }
  
    // Debug logging to see what's in the selectedDoctor object
    console.log("Session details:", sessionDetails);
    console.log("Selected doctor:", sessionDetails.selectedDoctor);
    console.log("VoiceId:", sessionDetails.selectedDoctor?.voiceId);
    console.log("AgentPrompt:", sessionDetails.selectedDoctor?.agentPrompt);
  
    // Check if selectedDoctor exists and has required properties
    if (!sessionDetails.selectedDoctor) {
      alert("Doctor configuration missing. Please try creating a new session.");
      return;
    }
  
    // Use fallback values if voiceId or agentPrompt are missing
    const voiceId = sessionDetails.selectedDoctor.voiceId || "will";
    const agentPrompt = sessionDetails.selectedDoctor.agentPrompt || "You are an AI medical assistant. Help the user with their health concerns.";
    
    console.log("Using voiceId:", voiceId);
    console.log("Using agentPrompt:", agentPrompt);
    
    setIsStartingCall(true);
    
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
      voiceId: voiceId
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: agentPrompt
        }
      ]
    }
    }
    // Debug logs
  
   
   
     //@ts-ignore

    vapi.start(VapiAgentConfig);
    // vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!)
    vapi.on('call-start', () => {console.log('Call started')
      setIsStartingCall(false)
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
      setIsStartingCall(false);
      alert('Vapi error: ' + (error?.message || JSON.stringify(error)));
    });

  }
  const endCall = async() => {
    // Prevent multiple disconnect attempts
    if (isEndingCall) {
      console.log("Disconnect already in progress, ignoring request");
      return;
    }
    
    setIsEndingCall(true);
    if(!vapiInstance) {
      console.log("No Vapi instance found, cleaning up state only");
      setIsEndingCall(false);
      return;
    }
    
    console.log("Starting call disconnect process...");
    
    try {
      // Generate the report before ending the call
      if (messages.length > 0 && sessionDetails) {
        await GenerateReport();
      }
      
      // Stop the call and wait for it to complete
      console.log("Stopping Vapi call...");
      await vapiInstance.stop();
      console.log("Vapi call stopped successfully");
      
      // Wait a moment for any pending operations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove all event listeners after the call is stopped
      console.log("Removing event listeners...");
      vapiInstance.off('call-start');
      vapiInstance.off('call-end');
      vapiInstance.off('message');
      vapiInstance.off('speech-start');
      vapiInstance.off('speech-end');
      vapiInstance.off('error');
      console.log("Event listeners removed");
      
      // Clean up state
      setCallStarted(false);
      setVapiInstance(null);
      setLiveTranscript("");
      setCurrentRole(null);
      
      // Navigate back to dashboard
      router.replace("/dashboard");
      toast.success("Your report is generated");
    } catch (error) {
      console.error("Error ending call:", error);
      
      // Even if report generation fails, try to disconnect the call
      try {
        if (vapiInstance) {
          console.log("Attempting emergency disconnect...");
          
          // Try to stop the call
          try {
            await vapiInstance.stop();
            console.log("Emergency stop successful");
          } catch (stopError) {
            console.error("Error during emergency stop:", stopError);
          }
          
          // Wait a moment
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Remove event listeners
          try {
            vapiInstance.off('call-start');
            vapiInstance.off('call-end');
            vapiInstance.off('message');
            vapiInstance.off('speech-start');
            vapiInstance.off('speech-end');
            vapiInstance.off('error');
            console.log("Emergency event listener removal successful");
          } catch (listenerError) {
            console.error("Error removing event listeners:", listenerError);
          }
        }
        
        // Always clean up state
        setCallStarted(false);
        setVapiInstance(null);
        setLiveTranscript("");
        setCurrentRole(null);
        
        router.replace("/dashboard");
        toast.error("Call ended but there was an issue generating the report");
      } catch (disconnectError) {
        console.error("Error during disconnect cleanup:", disconnectError);
        
        // Force cleanup even if everything fails
        setCallStarted(false);
        setVapiInstance(null);
        setLiveTranscript("");
        setCurrentRole(null);
        
        router.replace("/dashboard");
        toast.error("Error disconnecting call");
      }
    } finally {
      setIsEndingCall(false);
    }
  };
  const GenerateReport=async()=>{
    try {
      console.log("Generating report with data:", {
        messagesCount: messages.length,
        sessionDetailsId: sessionDetails?.id,
        sessionDetails: sessionDetails
      });
      
      const result=await axios.post("/api/medical-report",{
        messages:messages,
        sessionDetails:sessionDetails,
        sessionId:sessionDetails?.id, // Use the database id, not the sessionId string
      })
      console.log("Report generated successfully:", result.data);
      return result.data;
    } catch (error) {
      console.error("Error generating report:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data);
      }
      throw error;
    }
  }

  return (
    <div className="p-5 border rounded-3xl bg-secondary relative">
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
        {!callStarted ? (
          <Button 
            className="mt-20" 
            onClick={startCall} 
            disabled={isStartingCall}
            size="lg"
          >
            {isStartingCall ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <PhoneCall className="mr-2 h-4 w-4" />
                Start Call
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={endCall} 
            variant="destructive" 
            disabled={isEndingCall}
            size="lg"
          >
            {isEndingCall ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <PhoneOff className="mr-2 h-4 w-4" />
                Disconnect
              </>
            )}
          </Button>
        )}
      </div>
      }
    </div>
  )
}

export default MedicalVoiceAgent
