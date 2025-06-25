import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { sessionDetails } from '../medical-agent/[sessionId]/page'
import moment from 'moment'
import { useUser } from '@clerk/nextjs'

type props = {
    record: sessionDetails
}

function ViewReportDialog({ record }: props) {
    const { user } = useUser();
    
    // Extract report data from the record
    const report = record.report as any;
    
    // Check if report exists
    const hasReport = report && Object.keys(report).length > 0;
    
    // Get user name from authentication
    const userName = user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Anonymous";
    
    // Helper function to safely render arrays
    const renderList = (items: any[] | undefined) => {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return <span className="text-gray-500 italic">None mentioned</span>;
        }
        return (
            <ul className="list-disc list-inside text-sm mt-2">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

    // Helper function to safely render text
    const renderText = (text: string | undefined) => {
        if (!text || text.trim() === '') {
            return <span className="text-gray-500 italic">Not specified</span>;
        }
        return <p className="mt-2 text-sm">{text}</p>;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className="p-0 h-auto">View Report</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle asChild>
                        <h2 className="text-2xl font-semibold text-center text-blue-600">🩺 Medical AI Voice Agent Report</h2>
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="mt-6 space-y-6 text-gray-800">
                            {!hasReport ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 text-lg mb-2">📋 No Report Available</div>
                                    <p className="text-sm text-gray-400">
                                        The medical report hasn't been generated yet. 
                                        Complete a voice consultation to generate your personalized medical report.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Session Info */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Session Info</h3>
                                        <div className="grid grid-cols-2 gap-y-2 mt-2 text-sm">
                                            <div><span className="font-semibold">Doctor:</span> {record.selectedDoctor.specialist}</div>
                                            <div><span className="font-semibold">User:</span> {userName}</div>
                                            <div><span className="font-semibold">Consulted On:</span> {moment(record.createdOn).format("MMMM Do YYYY, h:mm a")}</div>
                                            <div><span className="font-semibold">Agent:</span> {report?.agent || record.selectedDoctor.specialist} AI</div>
                                        </div>
                                    </div>

                                    {/* Chief Complaint */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Chief Complaint</h3>
                                        {renderText(report?.chiefComplaint)}
                                    </div>

                                    {/* Summary */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Summary</h3>
                                        {renderText(report?.summary)}
                                    </div>

                                    {/* Symptoms */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Symptoms</h3>
                                        {renderList(report?.symptoms)}
                                    </div>

                                    {/* Duration & Severity */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Duration & Severity</h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm mt-2">
                                            <div><span className="font-semibold">Duration:</span> {report?.duration || "Not specified"}</div>
                                            <div><span className="font-semibold">Severity:</span> {report?.severity || "Not specified"}</div>
                                        </div>
                                    </div>

                                    {/* Medications Mentioned */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Medications Mentioned</h3>
                                        {renderList(report?.medicationsMentioned)}
                                    </div>

                                    {/* Recommendations */}
                                    <div>
                                        <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Recommendations</h3>
                                        {renderList(report?.recommendations)}
                                    </div>
                                </>
                            )}

                            {/* Footer */}
                            <div className="text-center text-xs text-gray-500 pt-4 border-t">
                                This report was generated by an AI Medical Assistant for informational purposes only.
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default ViewReportDialog
