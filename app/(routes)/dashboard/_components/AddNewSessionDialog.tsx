'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'


import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Loader2 } from 'lucide-react'
import DoctorAgentCard, { DoctorAgent } from './DoctorAgentCard'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { sessionDetails } from '../medical-agent/[sessionId]/page'


function AddNewSessionDialog() {
    const [note, setNote] = useState<string>()
    const [loading, setLoading] = useState(false);
    const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>();
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent>();
    const [history,setHistory]=useState<sessionDetails[]>([])
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const {has}=useAuth();
  //@ts-ignore
  const paidUser=has && has({plan:"pro"});
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(()=>{
    if (isMounted) {
        GetHistory();
    }
  },[isMounted])
  const GetHistory=async()=>{
    const result=await axios.get("/api/session-chat?sessionId=all");
    console.log(result.data);
    setHistory(result.data);
    
  }
    const onClickNext = async () => {
        setLoading(true);
        const result = await axios.post("/api/suggest-doctors", {
            notes: note,
        });
        console.log(result.data);
        setSuggestedDoctors(result.data);
        setLoading(false);
    }
    const onStartConsultation = async () => {
        setLoading(true);
        if (!selectedDoctor || typeof selectedDoctor !== 'object') {
            alert('Please select a doctor.');
            setLoading(false);
            return;
        }
        const result = await axios.post("/api/session-chat", {
            notes: note,
            selectedDoctor: selectedDoctor
        });
        console.log(result.data);
        if (result.data?.sessionId) {
            console.log(result.data?.sessionId);
            router.push(`/dashboard/medical-agent/${result.data?.sessionId}`);
        }
        setLoading(false);
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="mt-3" disabled={!paidUser && history?.length>0}>+ Start a Consultation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Basic Details</DialogTitle>
                    <DialogDescription asChild>
                       {!suggestedDoctors? <div>
                            <h2>Add Symptoms or Any Other Details</h2>
                            <Textarea placeholder="Add details here..." className="h-[200px] mt-1"
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>:
                        <div>
                            <h2>Select a Doctor</h2>
                        
                        <div className="grid grid-cols-3 gap-5">
                            {/* Suggested Doctors */}
                            {
                                suggestedDoctors.map((doctor:DoctorAgent,index:number)=>(
                                    <SuggestedDoctorCard key={index} DoctorAgent={doctor} setSelectedDoctor={()=>setSelectedDoctor(doctor) } selectedDoctor={selectedDoctor}/>
                                ))
                            }

                        </div>
                        </div>}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    {!suggestedDoctors?<Button disabled={!note||loading} onClick={onClickNext}>Next{loading?<Loader2 className='animate-spin'/>: <ArrowRight/>}</Button>:
                    <Button disabled={!selectedDoctor} onClick={onStartConsultation}>Start Consultation {loading?<Loader2 className='animate-spin'/>: <ArrowRight/>}</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewSessionDialog
