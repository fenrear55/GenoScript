"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, ArrowLeft, Pill, Dna, Loader2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { GeneCard } from "@/components/gene-card";
import { DrugResultCard } from "@/components/drug-result-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IPatient } from "@/models/patient";
import { checkDrugForPatient } from "@/lib/cpic";

interface Gene {
  _id: string;
  gene: string;
  diplotype: string;
  phenotype: string;
  plainEnglish: string;
}

interface PgxReport {
  lab: string;
  reportDate: string;
  genes: Gene[];
}

interface PatientData {
  patient: IPatient;
  pgxReport: PgxReport | null;
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"drug" | "gene">("drug");
  const [searchedDrug, setSearchedDrug] = useState<string | null>(null);
  const [searchedGene, setSearchedGene] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drugResult, setDrugResult] = useState<any>(null);
  const [drugLoading, setDrugLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/patients/${patientId}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#00C9A7]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <p className="text-[#718096]">Patient not found.</p>
        </div>
      </div>
    );
  }

  const { patient, pgxReport } = data;
  const genes = pgxReport?.genes ?? [];
  const geneNames = genes.map((g) => g.gene);

  const filteredGenes = genes.filter((g) =>
    g.gene.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleGeneSearch = (geneId?: string, geneName?: string) => {
    const id = geneId;
    if (id) {
      setSearchedGene(id);
      setSearchedDrug(null);
      setSearchQuery(geneName || id);
    }
    setShowSuggestions(false);
  };

  const handleDrugSearch = async (drug?: string) => {
    const searchTerm = (drug || searchQuery).toLowerCase();
    setShowSuggestions(false);
    setSearchedDrug(searchTerm);
    setSearchedGene(null);
    setDrugLoading(true);

    try {
      const result = await checkDrugForPatient(searchTerm, genes);
      console.log(result);
      setDrugResult(result);
    } catch {
      setDrugResult(null);
    } finally {
      setDrugLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchMode === "drug") {
      handleDrugSearch();
    } else {
      const firstMatch = filteredGenes[0];
      if (firstMatch) handleGeneSearch(firstMatch._id, firstMatch.gene);
    }
  };

  const geneResult = searchedGene
    ? genes.find((g) => g._id === searchedGene)
    : null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/patients"
          className="mb-6 inline-flex items-center text-sm text-[#718096] hover:text-[#00C9A7] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540]">
              {patient.fname} {patient.lname}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#718096]">
              <span>ID: {patientId}</span>
              <span>DOB: {patient.dob}</span>
              {pgxReport && <span>Report: {pgxReport.reportDate}</span>}
              {pgxReport && <span>Lab: {pgxReport.lab}</span>}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Drug Checker Section */}
          <div className="space-y-6">
            <Card className="border-[#E2E8F0] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-[#0A2540]">
                  {searchMode === "drug" ? (
                    <Pill className="h-5 w-5 text-[#00C9A7]" />
                  ) : (
                    <Dna className="h-5 w-5 text-[#00C9A7]" />
                  )}
                  {searchMode === "drug" ? "Drug Checker" : "Gene Lookup"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Mode Toggle */}
                <div className="flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F7FAFC]">
                  <button
                    onClick={() => {
                      setSearchMode("drug");
                      setSearchQuery("");
                      setSearchedDrug(null);
                      setSearchedGene(null);
                      setDrugResult(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      searchMode === "drug"
                        ? "bg-[#0A2540] text-white"
                        : "text-[#718096] hover:text-[#0A2540]"
                    }`}
                  >
                    <Pill className="h-4 w-4" />
                    Search by Drug
                  </button>
                  <button
                    onClick={() => {
                      setSearchMode("gene");
                      setSearchQuery("");
                      setSearchedDrug(null);
                      setSearchedGene(null);
                      setDrugResult(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      searchMode === "gene"
                        ? "bg-[#0A2540] text-white"
                        : "text-[#718096] hover:text-[#0A2540]"
                    }`}
                  >
                    <Dna className="h-4 w-4" />
                    Search by Gene
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718096]" />
                  <Input
                    type="text"
                    placeholder={
                      searchMode === "drug"
                        ? "Search for a medication (e.g., Codeine, Warfarin)..."
                        : "Search for a gene (e.g., CYP2D6, CYP2C19)..."
                    }
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                      setSearchedDrug(null);
                      setSearchedGene(null);
                      setDrugResult(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery) handleSearch();
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 pr-24 border-[#E2E8F0] bg-white focus:border-[#00C9A7] focus:ring-[#00C9A7]"
                  />
                  <Button
                    onClick={() => handleSearch()}
                    disabled={!searchQuery || drugLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0A2540] text-white hover:bg-[#00C9A7] hover:text-[#00513F] h-8 px-4"
                  >
                    {drugLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>

                  {/* Gene Suggestions */}
                  {showSuggestions &&
                    searchMode === "gene" &&
                    searchQuery &&
                    filteredGenes.length > 0 &&
                    !searchedGene && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                        {filteredGenes.map((geneData) => (
                          <button
                            key={geneData._id}
                            onClick={() =>
                              handleGeneSearch(geneData._id, geneData.gene)
                            }
                            className="w-full px-4 py-2 text-left text-sm text-[#1A202C] hover:bg-[#F0FFF4] first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                          >
                            <Dna className="h-3 w-3 text-[#718096]" />
                            {geneData.gene}
                            <span className="ml-auto text-xs text-[#718096]">
                              {geneData.phenotype}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                <p className="text-xs text-[#718096]">
                  {searchMode === "gene" && geneNames.length > 0
                    ? `Try: ${geneNames.slice(0, 5).join(", ")}`
                    : "Enter a drug name to check for gene interactions"}
                </p>
              </CardContent>
            </Card>

            {/* Drug Result */}
            {drugLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#00C9A7]" />
              </div>
            )}

            {!drugLoading && drugResult && (
              <DrugResultCard result={drugResult} />
            )}

            {/* Gene Search Results */}
            {geneResult && (
              <Card className="border-[#E2E8F0] bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-[#0A2540]">
                    <Dna className="h-5 w-5 text-[#00C9A7]" />
                    {geneResult.gene} Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#F7FAFC] p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
                        Diplotype
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#0A2540]">
                        {geneResult.diplotype}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F7FAFC] p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
                        Phenotype
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#0A2540]">
                        {geneResult.phenotype}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#F7FAFC] p-4 sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
                        What this means
                      </p>
                      <p className="mt-1 text-sm text-[#1A202C]">
                        {geneResult.plainEnglish}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!drugLoading && searchedDrug && !drugResult && (
              <Card className="border-[#718096] bg-[#F7FAFC]">
                <CardContent className="py-8 text-center">
                  <p className="text-[#718096]">
                    No pharmacogenomic data available for &quot;{searchQuery}
                    &quot;.
                  </p>
                  <p className="mt-2 text-sm text-[#718096]">
                    This drug may not have established PGx guidelines or is not
                    in our database.
                  </p>
                </CardContent>
              </Card>
            )}

            {searchedGene && !geneResult && (
              <Card className="border-[#718096] bg-[#F7FAFC]">
                <CardContent className="py-8 text-center">
                  <p className="text-[#718096]">
                    No results found for gene &quot;{searchQuery}&quot;.
                  </p>
                  <p className="mt-2 text-sm text-[#718096]">
                    This gene may not be in the patient&apos;s PGx report.
                  </p>
                </CardContent>
              </Card>
            )}

            {!searchedDrug && !searchedGene && !drugLoading && (
              <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-white p-12 text-center">
                {searchMode === "drug" ? (
                  <Pill className="mx-auto mb-4 h-12 w-12 text-[#E2E8F0]" />
                ) : (
                  <Dna className="mx-auto mb-4 h-12 w-12 text-[#E2E8F0]" />
                )}
                <p className="text-lg font-medium text-[#1A202C]">
                  {searchMode === "drug"
                    ? "Search for a medication"
                    : "Search for a gene"}
                </p>
                <p className="mt-2 text-sm text-[#718096]">
                  {searchMode === "drug"
                    ? "Enter a drug name above to check how this patient's genetics may affect their response"
                    : "Enter a gene name to view the patient's phenotype and plain English explanation"}
                </p>
              </div>
            )}
          </div>

          {/* PGx Results Sidebar */}
          <div className="space-y-6">
            <Card className="border-[#E2E8F0] bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-[#0A2540]">
                  <Dna className="h-5 w-5 text-[#00C9A7]" />
                  PGx Results
                  {pgxReport && (
                    <span className="ml-auto text-sm font-normal text-[#718096]">
                      {genes.length} genes
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {genes.length > 0 ? (
                  genes.map((gene) => (
                    <GeneCard
                      key={gene._id}
                      gene={{
                        name: gene.gene,
                        diplotype: gene.diplotype,
                        phenotype: gene.phenotype,
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-[#718096]">
                    No PGx report uploaded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
