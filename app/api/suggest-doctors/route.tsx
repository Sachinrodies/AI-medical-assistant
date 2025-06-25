import { openai } from "@/config/OpenAiModel"
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server"

import OpenAI from "openai"

export async function POST(req:NextRequest) {
  const {notes}=await req.json();
  try{
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {role:"system", content:JSON.stringify(AIDoctorAgents)},
        { role: "user", content: "User Notes/Symptomps: "+notes+", Depends on user notes and symptoms,please suggest list of doctors,return object in JSON only" }
      ],
    });
    const raRes=completion.choices[0].message;
    //@ts-ignore
    const Resp=raRes.content.trim().replace(
"```json","").replace("```","")
    const JSONResp=JSON.parse(Resp);
    
    // Ensure we return complete doctor objects with all required fields
    // Map the suggested doctors back to the complete AIDoctorAgents data
    let suggestedDoctors = [];
    if (Array.isArray(JSONResp)) {
      suggestedDoctors = JSONResp.map((suggestedDoctor: any) => {
        // Find the complete doctor object from AIDoctorAgents
        const completeDoctor = AIDoctorAgents.find(doctor => 
          doctor.id === suggestedDoctor.id || 
          doctor.specialist === suggestedDoctor.specialist
        );
        return completeDoctor || suggestedDoctor;
      });
    } else if (JSONResp.doctors && Array.isArray(JSONResp.doctors)) {
      suggestedDoctors = JSONResp.doctors.map((suggestedDoctor: any) => {
        const completeDoctor = AIDoctorAgents.find(doctor => 
          doctor.id === suggestedDoctor.id || 
          doctor.specialist === suggestedDoctor.specialist
        );
        return completeDoctor || suggestedDoctor;
      });
    } else {
      // If the response format is unexpected, return the original response
      suggestedDoctors = JSONResp;
    }
    
    return NextResponse.json(suggestedDoctors);
  }
  catch(e){
    console.error("Error in suggest-doctors:", e);
    return NextResponse.json({error: "Failed to suggest doctors"}, {status: 500});
  }
}
