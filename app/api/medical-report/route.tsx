import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/config/OpenAiModel"
import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
const REPORT_PROMPT=`You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based  on doctor AI agent info and conversation between AI medical agent and usertranscript, generate a structured report with the following fields:

1. sessionId: a unique session identifier  
2. agent: the medical specialist name (e.g., "General Physician AI")  
3. user: name of the patient or "Anonymous" if not provided  
4. timestamp: current date and time in ISO format  
5. chiefComplaint: one-sentence summary of the main health concern  
6. summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations  
7. symptoms: list of symptoms mentioned by the user  
8. duration: how long the user has experienced the symptoms  
9. severity: mild, moderate, or severe  
10. medicationsMentioned: list of any medicines mentioned  
11. recommendations: list of AI suggestions (e.g., rest, see a doctor)

Return the result in this JSON format:

{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}

Only include valid fields. Respond with nothing else.

`



export async function POST(req:NextRequest){
    try {
      const {sessionId,sessionDetails,messages}=await req.json();
      
      console.log("Medical report API called with:", {
        sessionId,
        sessionDetailsId: sessionDetails?.id,
        messagesCount: messages?.length
      });
      
      if (!sessionId) {
        console.error("No sessionId provided");
        return NextResponse.json({error:"Session ID is required"},{status:400});
      }
      
      if (!messages || messages.length === 0) {
        console.error("No messages provided");
        return NextResponse.json({error:"Messages are required"},{status:400});
      }
      
      const UserInput="AI Doctor Agent Info:"+JSON.stringify(sessionDetails)+",Conversations:"+JSON.stringify(messages)
      console.log("Sending to OpenAI with input length:", UserInput.length);
      
      const completion = await openai.chat.completions.create({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {role:"system", content:REPORT_PROMPT},
            { role: "user", content: UserInput }
          ],
        });
        
      const raRes=completion.choices[0].message;
      //@ts-ignore
      const Resp=raRes.content.trim().replace("```json","").replace("```","")
      console.log("Raw AI response:", Resp);
      
      const JSONResp=JSON.parse(Resp);
      console.log("Parsed JSON response:", JSONResp);
      
      const result=await db.update(sessionChatTable).set({
       report:JSONResp,
       conversation:messages
      }).where(eq(sessionChatTable.id,sessionId))
      
      console.log("Database update result:", result);
      return NextResponse.json(JSONResp);
    }catch(error){
      console.error("Medical report API error:", error);
      return NextResponse.json({error:"Internal Server Error", details: error instanceof Error ? error.message : "Unknown error"},{status:500});
    }
}