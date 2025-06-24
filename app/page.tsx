"use client";

import dynamic from "next/dynamic";
import { FeatureBentoGrid } from "./_components/FeatureBentoGrid";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

// Dynamically import motion components with SSR disabled
const MotionSpan = dynamic(() => import("motion/react").then(mod => ({ default: mod.motion.span })), { ssr: false });
const MotionP = dynamic(() => import("motion/react").then(mod => ({ default: mod.motion.p })), { ssr: false });
const MotionDiv = dynamic(() => import("motion/react").then(mod => ({ default: mod.motion.div })), { ssr: false });

export default function HeroSectionOne() {
  return (
    <div className="relative mt-2 mb-10 flex  flex-col items-center justify-center">
      <Navbar />
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {" 🩺 Revolutionize Patient Care with AI Voice Agents"
            .split(" ")
            .map((word, index) => (
              <MotionSpan
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </MotionSpan>
            ))}
        </h1>
        <MotionP
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          Provide 24/7 intelligent medical support using conversational AI. Triage symptoms, book appointments, and deliver empathetic care with voice-first automation.
        </MotionP>
        <Link href="/sign-in">
        <MotionDiv
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
           Get Started
          </button>
          

          
        </MotionDiv>
        </Link>
        <MotionDiv
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black p-6 max-w-2xl mx-auto">
            <div className="mb-4 text-center text-lg font-semibold text-blue-700 dark:text-blue-300">AI Medical Agent Chat Example</div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Image src="/doctor1.png" alt="Doctor" width={40} height={40} className="rounded-full" />
                <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl max-w-xs text-sm">
                  Hello! How can I assist you with your health today?
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <Image src="/default.png" alt="Patient" width={40} height={40} className="rounded-full" />
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl max-w-xs text-sm">
                  Hi Doctor, I've been having headaches and a mild fever since yesterday.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Image src="/doctor1.png" alt="Doctor" width={40} height={40} className="rounded-full" />
                <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl max-w-xs text-sm">
                  I'm sorry to hear that. Can you tell me if you have any other symptoms, like a sore throat or cough?
                </div>
              </div>
              <div className="flex items-start gap-3 flex-row-reverse">
                <Image src="/default.png" alt="Patient" width={40} height={40} className="rounded-full" />
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl max-w-xs text-sm">
                  I have a slight sore throat, but no cough.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Image src="/doctor1.png" alt="Doctor" width={40} height={40} className="rounded-full" />
                <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl max-w-xs text-sm">
                  Thank you for sharing. Based on your symptoms, it may be a mild viral infection. Stay hydrated and rest. If symptoms worsen, please consult a healthcare provider.
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
      <FeatureBentoGrid/>
    </div>
  );
}

const Navbar = () => {
  const {user} = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center ">
        <Image src="/logo.png" alt="AI Medical Voice Agent" width={200} height={200} className="rounded-lg" />
       
      </div>
      {!user?
      <Link href="/sign-in">
      <button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
        Login
      </button></Link>:
      <div className="flex items-center gap-5">
        {isMounted && <UserButton/>}
        <Button>
          <Link href="/dashboard">
            Dashboard
          </Link>
        </Button>

      </div>
}
    </nav>
  );
};


