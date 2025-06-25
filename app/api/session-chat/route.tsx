import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm"; 
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req:NextRequest){
    const {notes,selectedDoctor}=await req.json();
    const user=await currentUser();
  
    try{
        // Validate and ensure selectedDoctor has all required fields
        let validatedDoctor = selectedDoctor;
        if (selectedDoctor && (!selectedDoctor.voiceId || !selectedDoctor.agentPrompt)) {
            // Try to find the complete doctor data from AIDoctorAgents
            const completeDoctor = AIDoctorAgents.find(doctor => 
                doctor.id === selectedDoctor.id || 
                doctor.specialist === selectedDoctor.specialist
            );
            if (completeDoctor) {
                validatedDoctor = completeDoctor;
            } else {
                // Provide fallback values if doctor not found
                validatedDoctor = {
                    ...selectedDoctor,
                    voiceId: selectedDoctor.voiceId || "will",
                    agentPrompt: selectedDoctor.agentPrompt || "You are an AI medical assistant. Help the user with their health concerns."
                };
            }
        }
        
        const sessionId=uuidv4();
        const result=await db.insert(sessionChatTable).values({
            sessionId: sessionId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            notes: notes,
            selectedDoctor: validatedDoctor,
            createdOn: (new Date()).toString(),
            //@ts-ignore
        }).returning({sessionChatTable});
        return NextResponse.json(result[0]?.sessionChatTable);
        
    }catch(error){
       console.error("Error creating session:", error);
       return NextResponse.json({error: "Failed to create session"}, {status: 500});
    }
}
export async function GET(req:NextRequest){
    const {searchParams}=new URL(req.url);
    const sessionId=searchParams.get("sessionId");
    const user=await currentUser();
    if(sessionId==="all"){
        const result=await db.select().from(sessionChatTable)
        //@ts-ignore
        .where(eq(sessionChatTable.createdBy,user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(sessionChatTable.id));
        return NextResponse.json(result);


    }
    else{
        const result=await db.select().from(sessionChatTable)
        //@ts-ignore
        .where(eq(sessionChatTable.sessionId,sessionId));
        
        if (result[0]) {
            // Validate and fix the selectedDoctor data if needed
            let sessionData = result[0];
            if (sessionData.selectedDoctor && (!sessionData.selectedDoctor.voiceId || !sessionData.selectedDoctor.agentPrompt)) {
                console.log("Fixing incomplete doctor data for session:", sessionId);
                const completeDoctor = AIDoctorAgents.find(doctor => 
                    doctor.id === sessionData.selectedDoctor.id || 
                    doctor.specialist === sessionData.selectedDoctor.specialist
                );
                if (completeDoctor) {
                    sessionData.selectedDoctor = completeDoctor;
                } else {
                    // Provide fallback values
                    sessionData.selectedDoctor = {
                        ...sessionData.selectedDoctor,
                        voiceId: sessionData.selectedDoctor.voiceId || "will",
                        agentPrompt: sessionData.selectedDoctor.agentPrompt || "You are an AI medical assistant. Help the user with their health concerns."
                    };
                }
            }
            return NextResponse.json(sessionData);
        }
        
        return NextResponse.json({error: "Session not found"}, {status: 404});
    }
   

}