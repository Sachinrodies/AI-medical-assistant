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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight } from 'lucide-react'
import { DoctorAgent } from './DoctorAgentCard'
import { useRouter } from 'next/navigation'
import axios from 'axios'


function AddNewSessionDialog() {
    const [note, setNote] = useState<string>()
    const [loading, setLoading] = useState(false);
    const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent>();
    const router = useRouter();
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
        const result = await axios.post("/api/session-chat", {
            notes: note,
            selectedDoctor: selectedDoctor,
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
            <DialogTrigger>
                <Button className="mt-3">+ Start a Consultation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Basic Details</DialogTitle>
                    <DialogDescription asChild>
                        <div>
                            <h2>Add Symptoms or Any Other Details</h2>
                            <Textarea placeholder="Add details here..." className="h-[200px] mt-1"
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                    </DialogDescription>
                </DialogHeader>
                {suggestedDoctors.length === 0 ? (
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button disabled={!note || loading} onClick={onClickNext}>{loading ? "Loading..." : <>Next <ArrowRight /></>}</Button>
                    </DialogFooter>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 my-4">
                            {suggestedDoctors.map((doctor) => (
                                <div key={doctor.id} onClick={() => setSelectedDoctor(doctor)}>
                                    <div className={`border rounded-xl p-2 cursor-pointer ${selectedDoctor?.id === doctor.id ? 'border-blue-500' : ''}`}>
                                        <img src={doctor.image} alt={doctor.specialist} className="w-16 h-16 object-cover rounded-full mx-auto" />
                                        <h3 className="text-center font-bold mt-2">{doctor.specialist}</h3>
                                        <p className="text-center text-xs">{doctor.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <DialogClose>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button disabled={!selectedDoctor || loading} onClick={onStartConsultation}>{loading ? "Starting..." : "Start Consultation"}</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AddNewSessionDialog
