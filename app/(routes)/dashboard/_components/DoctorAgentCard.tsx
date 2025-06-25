'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { IconArrowRight } from '@tabler/icons-react'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
export type DoctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string,
    voiceId:string,
    subscriptionRequired:boolean

   
}
type props={
    doctor:DoctorAgent
}

function DoctorAgentCard({doctor}:props) {
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const {has}=useAuth();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  //@ts-ignore
  const paidUser=isMounted && has && has({plan:"pro"});
  
  const onStartConsultation = async () => {
    setLoading(true);
   
    const result = await axios.post("/api/session-chat", {
        notes: "New Query",
        selectedDoctor: doctor
    });
    
    if (result.data?.sessionId) {
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
    }
    setLoading(false);
}
  return (
    <div className='relative' >
     {  doctor.subscriptionRequired && <Badge className='absolute m-2 right-0'>
        Premium
        

      </Badge>}
        <Image src={doctor.image} alt={doctor.specialist} width={200} height={300}
        className="w-full h-[250px] object-cover rounded-xl"/>
        <h2 className="font-bold mt-1 ">{doctor.specialist}</h2>
        <p className="line-clamp-2 text-sm text-gray-500">{doctor.description}</p>
        <Button className="w-full mt-2" disabled={doctor.subscriptionRequired && !paidUser} onClick={onStartConsultation}>Start Consultation{loading? <Loader2 className='animate-spin'/>: <IconArrowRight/>}
           
        </Button>
      
    </div>
  )
}

export default DoctorAgentCard
