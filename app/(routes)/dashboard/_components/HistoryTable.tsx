import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { sessionDetails } from '../medical-agent/[sessionId]/page'
import { Button } from '@/components/ui/button'
import moment from 'moment'
import ViewReportDialog from './ViewReportDialog'
type props={
    history:sessionDetails[]

}

const HistoryTable = ({history}:props) => {
    return (
        <div>
            <Table>
                <TableCaption>Previous Consultations Reports</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead >AI Medical Specialist</TableHead>
                        <TableHead >Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((record:sessionDetails,index:number)=>(
                          <TableRow key={record.sessionId || index}>
                          <TableCell className="font-medium">{record.selectedDoctor.specialist}</TableCell>
                          <TableCell>{record.notes}</TableCell>
                          <TableCell>{moment(new Date(record.createdOn)).fromNow()}</TableCell>
                          <TableCell className="text-right">
                            <ViewReportDialog record={record}/>
                          </TableCell>
                      </TableRow>

                    ))}
                  
                </TableBody>
            </Table>

        </div>
    )
}

export default HistoryTable
