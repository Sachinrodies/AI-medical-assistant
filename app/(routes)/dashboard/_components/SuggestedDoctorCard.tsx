import React from 'react'
import { DoctorAgent } from './DoctorAgentCard'
import Image from 'next/image'
type props={
    DoctorAgent:DoctorAgent,
    setSelectedDoctor:any,
    selectedDoctor:DoctorAgent|undefined
}

function SuggestedDoctorCard({DoctorAgent, setSelectedDoctor, selectedDoctor}: props) {
  return (
    <div className={`flex flex-col items-center
    border rounded-2xl shadow p-5
    hover:border-blue-500 cursor-pointer
    ${selectedDoctor?.id==DoctorAgent?.id && "border-blue-500"}`} onClick={()=>setSelectedDoctor(DoctorAgent)}>
        <Image src={DoctorAgent?.image}
        alt={DoctorAgent?.specialist}
        width={70}
        height={70}
        className='w-[50px] h-[50px] rounded-4xl object-cover'
        />
        <h2 className='text-sm text-center font-bold'>{DoctorAgent.specialist}</h2>
        <p className='text-xs text-center line-clamp-2'>{DoctorAgent.description}</p>
      
    </div>
  )
}

export default SuggestedDoctorCard
