import React from 'react'
import { PricingTable } from '@clerk/nextjs'

function Billing() {
  return (
    <div className="px-10 md:px-24 lg:px-48 ">
        <h2 className='text-3xl font-bold mb-10 '>Join Subscription</h2>
          <PricingTable />
        
      
    </div>
  )
}

export default Billing
