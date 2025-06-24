"use client"
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const menuOptions=[
   
    {
        id:1,
        name:"Home",
        path:"/dashboard"
    },
    {
        id:2,
        name:"History",
        path:"/dashboard/history"
    },
    {
        id:3,
        name:"Pricing",
        path:"/dashboard/billing"
    },
    
]

function AppHeader() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="flex justify-between items-center p-4 shadow px-10 md:px-20 lg:px-40 bg-white">
        <Link href="/dashboard">
            <Image src="/logo.png" alt="logo" width={180} height={90} />
        </Link>
        <nav className="hidden md:flex gap-12 items-center">
            {menuOptions.map((option,index)=>(
                <Link key={index} href={option.path}>
                   <h2 className="hover:font-bold cursor-pointer transition-all">{option.name}</h2>
                </Link>
            ))}
        </nav>
        <div className="flex items-center">
            {isMounted && <UserButton/>}
        </div>
    </header>
  )
}

export default AppHeader
