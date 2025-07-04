import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm"; 
import { AIDoctorAgents } from "@/shared/list";

// Type definition for DoctorAgent
type DoctorAgent = {
    id: number;
    specialist: string;
    description: string;
    image: string;
    agentPrompt: string;
    voiceId: string;
    subscriptionRequired: boolean;
};

// Type guard to check if an object is a DoctorAgent
function isDoctorAgent(obj: any): obj is DoctorAgent {
    return obj && 
           typeof obj.id === 'number' &&
           typeof obj.specialist === 'string' &&
           typeof obj.description === 'string' &&
           typeof obj.image === 'string' &&
           typeof obj.agentPrompt === 'string' &&
           typeof obj.voiceId === 'string' &&
           typeof obj.subscriptionRequired === 'boolean';
}

export async function POST(req:NextRequest){
    const {notes,selectedDoctor}=await req.json();
    const user=await currentUser();
  
    try{
        // Validate and ensure selectedDoctor has all required fields
        let validatedDoctor = selectedDoctor;
        if (selectedDoctor && isDoctorAgent(selectedDoctor) && (!selectedDoctor.voiceId || !selectedDoctor.agentPrompt)) {
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
            const selectedDoctor = sessionData.selectedDoctor as any;
            
            if (selectedDoctor && isDoctorAgent(selectedDoctor) && (!selectedDoctor.voiceId || !selectedDoctor.agentPrompt)) {
                console.log("Fixing incomplete doctor data for session:", sessionId);
                const completeDoctor = AIDoctorAgents.find(doctor => 
                    doctor.id === selectedDoctor.id || 
                    doctor.specialist === selectedDoctor.specialist
                );
                if (completeDoctor) {
                    sessionData.selectedDoctor = completeDoctor;
                } else {
                    // Provide fallback values
                    sessionData.selectedDoctor = {
                        ...selectedDoctor,
                        voiceId: selectedDoctor.voiceId || "will",
                        agentPrompt: selectedDoctor.agentPrompt || "You are an AI medical assistant. Help the user with their health concerns."
                    };
                }
            }
            return NextResponse.json(sessionData);
        }
        
        return NextResponse.json({error: "Session not found"}, {status: 404});
    }
   

}

export async function DELETE(req:NextRequest){
    const {searchParams}=new URL(req.url);
    const sessionId=searchParams.get("sessionId");
    const user=await currentUser();
    
    if(!sessionId) {
        return NextResponse.json({error: "Session ID required"}, {status: 400});
    }
    
    try{
        const result=await db.delete(sessionChatTable)
        //@ts-ignore
        .where(eq(sessionChatTable.sessionId,sessionId))
        .returning();
        
        return NextResponse.json({message: "Session deleted successfully"});
    }catch(error){
        console.error("Error deleting session:", error);
        return NextResponse.json({error: "Failed to delete session"}, {status: 500});
    }
}