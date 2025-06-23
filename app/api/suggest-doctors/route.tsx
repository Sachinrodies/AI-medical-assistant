import React from 'react'
import { NextResponse } from "next/server";
import { AIDoctorAgents } from "@/shared/list";

const keywordDoctorMap = [
  { keywords: ["headache", "fever", "cough", "cold", "pain", "general"], specialists: ["General Physician"] },
  { keywords: ["child", "baby", "pediatric", "kids", "infant"], specialists: ["Pediatrician"] },
  { keywords: ["skin", "rash", "acne", "itch", "eczema"], specialists: ["Dermatologist"] },
  { keywords: ["anxiety", "depression", "mental", "stress", "psychology", "sad"], specialists: ["Psychologist"] },
  { keywords: ["diet", "weight", "nutrition", "food", "eat"], specialists: ["Nutritionist"] },
  { keywords: ["heart", "chest", "cardio", "bp", "pressure"], specialists: ["Cardiologist"] },
  { keywords: ["ear", "nose", "throat", "ent", "sinus"], specialists: ["ENT Specialist"] },
  { keywords: ["bone", "joint", "muscle", "orthopedic", "fracture", "back"], specialists: ["Orthopedic"] },
  { keywords: ["period", "pregnancy", "women", "gyne", "menstrual", "hormone"], specialists: ["Gynecologist"] },
  { keywords: ["tooth", "teeth", "mouth", "gum", "dentist", "oral"], specialists: ["Dentist"] },
];

function route() {
  return (
    <div>
      
    </div>
  )
}

export async function POST(req: Request) {
  const { notes } = await req.json();
  const lowerNotes = (notes || "").toLowerCase();
  let matchedSpecialists = new Set();

  for (const map of keywordDoctorMap) {
    if (map.keywords.some(kw => lowerNotes.includes(kw))) {
      map.specialists.forEach(spec => matchedSpecialists.add(spec));
    }
  }

  let filtered = AIDoctorAgents.filter(doc => matchedSpecialists.has(doc.specialist));
  // If no match, return all as fallback
  if (filtered.length === 0) filtered = AIDoctorAgents;

  return NextResponse.json(filtered);
}

export default route
