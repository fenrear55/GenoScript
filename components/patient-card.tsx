"use client"

import Link from "next/link"
import { FileText, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  reportDate: string
  geneCount: number
}

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card className="group border-[#E2E8F0] bg-white transition-all hover:border-[#00C9A7] hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-[#1A202C]">{patient.name}</h3>
              <p className="text-sm text-[#718096]">ID: {patient.id}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-[#718096]">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                DOB: {patient.dateOfBirth}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {patient.geneCount} genes
              </span>
            </div>
            
            <p className="text-xs text-[#718096]">
              Report uploaded: {patient.reportDate}
            </p>
          </div>
          
          <Link href={`/patients/${patient.id}`}>
            <Button 
              className="bg-[#0A2540] text-white hover:bg-[#00C9A7] hover:text-[#00513F] transition-colors"
            >
              View PGx
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
