import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@tabler/icons-react'
import Image from 'next/image'
import React from 'react'
export type DoctorAgent={
    id:number,
    specialist:string,
    description:string,
    image:string,
    agentPrompt:string,
    voiceId:string,

   
}
type props={
    doctor:DoctorAgent
}

function DoctorAgentCard({doctor}:props) {
  return (
    <div >
        <Image src={doctor.image} alt={doctor.specialist} width={200} height={300}
        className="w-full h-[250px] object-cover rounded-xl"/>
        <h2 className="font-bold mt-1 ">{doctor.specialist}</h2>
        <p className="line-clamp-2 text-sm text-gray-500">{doctor.description}</p>
        <Button className="w-full mt-2">Start Consultation
            <IconArrowRight/>
        </Button>
      
    </div>
  )
}

export default DoctorAgentCard
