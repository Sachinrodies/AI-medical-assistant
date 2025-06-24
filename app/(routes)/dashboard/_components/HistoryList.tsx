'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import AddNewSessionDialog from './AddNewSessionDialog'
import axios from 'axios'
import HistoryTable from './HistoryTable'
import { sessionDetails } from '../medical-agent/[sessionId]/page'

function HistoryList() {
    const [history,setHistory]=useState<sessionDetails[]>([])
    useEffect(()=>{
      GetHistory();
      

    },[])
    const GetHistory=async()=>{
      const result=await axios.get("/api/session-chat?sessionId=all");
      console.log(result.data);
      setHistory(result.data);
    }
  return (
    <div className="mt-10">
      {
        history.length==0?
        <div className="flex items-center flex-col justify-center p-7 border border-dashed  rounded-2xl border-2">
            <Image src={`/medical-assistance.png`} alt="medical-assistance" width={150} height={150}/>
            <h2 className="font-bold text-xl mt-2">No Recent Consultations</h2>
            <p>It looks like you haven't had any consultations yet. Start by booking an appointment with a doctor.</p>
            <AddNewSessionDialog/>
            
            
        </div>
        :
        <div>
            <HistoryTable history={history}/>
        </div>
      }
        
      
    </div>
  )
}

export default HistoryList
