"use client";

import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { PatientCard } from "@/components/patient-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Demo patient data
const demoPatients = [
  {
    id: "PX-001",
    name: "Sarah Johnson",
    dateOfBirth: "1985-03-15",
    reportDate: "March 18, 2026",
    geneCount: 12,
  },
  {
    id: "PX-002",
    name: "Michael Chen",
    dateOfBirth: "1972-08-22",
    reportDate: "March 15, 2026",
    geneCount: 10,
  },
  {
    id: "PX-003",
    name: "Emily Rodriguez",
    dateOfBirth: "1990-11-08",
    reportDate: "March 10, 2026",
    geneCount: 14,
  },
  {
    id: "PX-004",
    name: "James Williams",
    dateOfBirth: "1968-05-30",
    reportDate: "March 5, 2026",
    geneCount: 11,
  },
];

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = demoPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540]">Patients</h1>
            <p className="mt-1 text-[#718096]">
              Select a patient to view their PGx report and check drug
              interactions
            </p>
          </div>

          <Link href="/new">
            <Button className="bg-[#0A2540] text-white hover:bg-[#00C9A7] hover:text-[#00513F]">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
            <Input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#E2E8F0] bg-white focus:border-[#00C9A7] focus:ring-[#00C9A7]"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-white p-12 text-center">
              <p className="text-[#718096]">
                No patients found matching your search.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
