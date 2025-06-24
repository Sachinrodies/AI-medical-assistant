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

type props = {
    record: sessionDetails
}

function ViewReportDialog({ record }: props) {
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

                            {/* Session Info */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Session Info</h3>
                                <div className="grid grid-cols-2 gap-y-2 mt-2 text-sm">
                                    <div><span className="font-semibold">Doctor:</span> {record.selectedDoctor.specialist}</div>
                                    <div><span className="font-semibold">User:</span> Anonymous</div>
                                    <div><span className="font-semibold">Consulted On:</span> {moment(record.createdOn).format("MMMM Do YYYY, h:mm a")}</div>
                                    <div><span className="font-semibold">Agent:</span> {record.selectedDoctor.specialist} AI</div>
                                </div>
                            </div>

                            {/* Chief Complaint */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Chief Complaint</h3>
                                <p className="mt-2 text-sm">User reports sharp back pain.</p>
                            </div>

                            {/* Summary */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Summary</h3>
                                <p className="mt-2 text-sm">
                                    The user is experiencing sharp back pain. The AI assistant recommended over-the-counter pain relievers like ibuprofen or acetaminophen, emphasizing the importance of following dosage instructions. It also advised consulting a healthcare provider if the pain persists or worsens.
                                </p>
                            </div>

                            {/* Symptoms */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Symptoms</h3>
                                <ul className="list-disc list-inside text-sm mt-2">
                                    <li>back pain</li>
                                    <li>sharp pain</li>
                                </ul>
                            </div>

                            {/* Duration & Severity */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Duration & Severity</h3>
                                <div className="grid grid-cols-2 gap-y-2 text-sm mt-2">
                                    <div><span className="font-semibold">Duration:</span> Not specified</div>
                                    <div><span className="font-semibold">Severity:</span> Moderate</div>
                                </div>
                            </div>

                            {/* Medications Mentioned */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Medications Mentioned</h3>
                                <ul className="list-disc list-inside text-sm mt-2">
                                    <li>ibuprofen</li>
                                    <li>acetaminophen</li>
                                </ul>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h3 className="text-blue-500 text-lg font-semibold border-b pb-1">Recommendations</h3>
                                <ul className="list-disc list-inside text-sm mt-2 text-blue-600">
                                    <li>Try over-the-counter pain relievers (ibuprofen or acetaminophen)</li>
                                    <li>Follow dosage instructions carefully</li>
                                    <li>Consult a healthcare provider if pain persists or worsens</li>
                                </ul>
                            </div>

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
