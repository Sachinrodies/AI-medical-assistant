"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext'
export type UserDetail={
    name:string;
    email:string;
    credits:number;
}

const Provider = ({children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    const {user}=useUser();
    const [userDetail,setUserDetail]=useState<any>();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(()=>{
        if (isMounted && user) {
            CreateNewUser();
        }
    },[user, isMounted])

    const CreateNewUser=async()=>{
        const result=await axios.post("/api/users");
        setUserDetail(result.data);

    }
  return (
    <div>
        <UserDetailContext.Provider value={userDetail}>
        {children}
        </UserDetailContext.Provider>
        
      
    </div>
  )
}

export default Provider
