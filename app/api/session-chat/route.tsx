import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/db";
import { sessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm"

export async function POST(req:NextRequest){
    const {notes,selectedDoctor}=await req.json();
    const user=await currentUser();
    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }
    try{
        const sessionId=uuidv4();
        const result=await db.insert(sessionChatTable).values({
            sessionId: sessionId,
            createdBy: user.primaryEmailAddress.emailAddress,
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdOn: new Date()
        }).returning();
        return NextResponse.json(result[0]);
        
    }catch(error){
       return NextResponse.json(error);
    }
}
export async function GET(req:NextRequest){
    const {searchParams}=new URL(req.url);
    const sessionId=searchParams.get("sessionId");
    const user=await currentUser();
    const result=await db.select().from(sessionChatTable)
    //@ts-ignore
    .where(eq(sessionChatTable.sessionId,sessionId));
    return NextResponse.json(result[0]);

}