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
    
    if(!sessionId) {
        return NextResponse.json({error: "Session ID required"}, {status: 400});
    }
    
    try{
        const result=await db.select().from(sessionChatTable)
        //@ts-ignore
        .where(eq(sessionChatTable.sessionId,sessionId))
        .orderBy(desc(sessionChatTable.createdOn))
        .limit(1);
        
        if(result.length===0) {
            return NextResponse.json({error: "Session not found"}, {status: 404});
        }
        
        let sessionData=result[0];
        
        // Fix incomplete doctor data if needed
        if (sessionData.selectedDoctor && (!sessionData.selectedDoctor.voiceId || !sessionData.selectedDoctor.agentPrompt)) {
            const completeDoctor = AIDoctorAgents.find(doctor => 
                doctor.id === sessionData.selectedDoctor.id || 
                doctor.specialist === sessionData.selectedDoctor.specialist
            );
            if (completeDoctor) {
                sessionData.selectedDoctor = completeDoctor;
            }
        }
        
        return NextResponse.json(sessionData);
        
    }catch(error){
        console.error("Error fetching session:", error);
        return NextResponse.json({error: "Failed to fetch session"}, {status: 500});
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