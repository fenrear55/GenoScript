"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Search, ArrowLeft, Pill, Dna } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { GeneCard } from "@/components/gene-card";
import { DrugResultCard } from "@/components/drug-result-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Demo patient data
const patientData = {
  "PX-001": {
    name: "Sarah Johnson",
    dateOfBirth: "March 15, 1985",
    reportDate: "March 18, 2026",
    genes: [
      {
        name: "CYP2D6",
        diplotype: "*1/*4",
        phenotype: "Intermediate Metabolizer",
        activityScore: "1.0",
      },
      {
        name: "CYP2C19",
        diplotype: "*1/*1",
        phenotype: "Normal Metabolizer",
        activityScore: "2.0",
      },
      {
        name: "CYP2C9",
        diplotype: "*1/*2",
        phenotype: "Intermediate Metabolizer",
        activityScore: "1.5",
      },
      { name: "CYP3A5", diplotype: "*3/*3", phenotype: "Poor Metabolizer" },
      {
        name: "SLCO1B1",
        diplotype: "*1/*5",
        phenotype: "Intermediate Function",
      },
      {
        name: "VKORC1",
        diplotype: "-1639G>A",
        phenotype: "Variable Warfarin Sensitivity",
      },
    ],
  },
};

// Demo drug database
const drugDatabase: Record<
  string,
  {
    drugName: string;
    severity: "avoid" | "caution" | "safe" | "neutral";
    gene: string;
    phenotype: string;
    recommendation: string;
    alternatives?: string[];
    cpicLevel?: string;
  }
> = {
  codeine: {
    drugName: "Codeine",
    severity: "caution",
    gene: "CYP2D6",
    phenotype: "Intermediate Metabolizer",
    recommendation:
      "Reduced conversion to morphine. May experience decreased analgesic effect. Consider alternative analgesics or increase dose by 25-50% while monitoring for efficacy.",
    alternatives: ["Morphine", "Oxycodone", "Hydromorphone"],
    cpicLevel: "A",
  },
  tramadol: {
    drugName: "Tramadol",
    severity: "caution",
    gene: "CYP2D6",
    phenotype: "Intermediate Metabolizer",
    recommendation:
      "Decreased formation of active metabolite. Consider alternative analgesics for pain not adequately controlled.",
    alternatives: ["Morphine", "Tapentadol"],
    cpicLevel: "A",
  },
  clopidogrel: {
    drugName: "Clopidogrel",
    severity: "safe",
    gene: "CYP2C19",
    phenotype: "Normal Metabolizer",
    recommendation:
      "Standard dosing is expected to result in normal CYP2C19-mediated clopidogrel metabolism. Continue with standard therapy.",
    cpicLevel: "A",
  },
  warfarin: {
    drugName: "Warfarin",
    severity: "caution",
    gene: "VKORC1/CYP2C9",
    phenotype: "Variable Sensitivity",
    recommendation:
      "Patient has CYP2C9 intermediate metabolizer status and VKORC1 variant. Consider 20-40% dose reduction from standard starting dose. More frequent INR monitoring recommended.",
    cpicLevel: "A",
  },
  simvastatin: {
    drugName: "Simvastatin",
    severity: "avoid",
    gene: "SLCO1B1",
    phenotype: "Intermediate Function",
    recommendation:
      "Increased risk of myopathy with high-dose simvastatin. Avoid simvastatin >20mg daily. Consider alternative statin with lower myopathy risk.",
    alternatives: ["Pravastatin", "Rosuvastatin", "Fluvastatin"],
    cpicLevel: "A",
  },
  tacrolimus: {
    drugName: "Tacrolimus",
    severity: "caution",
    gene: "CYP3A5",
    phenotype: "Poor Metabolizer",
    recommendation:
      "Patient is a CYP3A5 non-expresser. May require lower initial dose. Standard initial dose may be appropriate, but monitor drug levels closely.",
    cpicLevel: "A-B",
  },
  omeprazole: {
    drugName: "Omeprazole",
    severity: "safe",
    gene: "CYP2C19",
    phenotype: "Normal Metabolizer",
    recommendation:
      "Standard dosing is expected to result in adequate acid suppression. No dosage adjustment needed.",
    cpicLevel: "A",
  },
  fluoxetine: {
    drugName: "Fluoxetine",
    severity: "caution",
    gene: "CYP2D6",
    phenotype: "Intermediate Metabolizer",
    recommendation:
      "Potential for slightly elevated drug concentrations. Consider standard dose with monitoring for adverse effects or consider alternative SSRI.",
    alternatives: ["Sertraline", "Citalopram", "Escitalopram"],
    cpicLevel: "A",
  },
};

// Map genes to their related drugs
const geneToDrugs: Record<string, string[]> = {
  CYP2D6: ["codeine", "tramadol", "fluoxetine"],
  CYP2C19: ["clopidogrel", "omeprazole"],
  CYP2C9: ["warfarin"],
  CYP3A5: ["tacrolimus"],
  SLCO1B1: ["simvastatin"],
  VKORC1: ["warfarin"],
};

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const patient = patientData["PX-001"]; // Demo: always show first patient

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"drug" | "gene">("drug");
  const [searchedDrug, setSearchedDrug] = useState<string | null>(null);
  const [searchedGene, setSearchedGene] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const drugNames = Object.keys(drugDatabase);
  const geneNames = patient.genes.map((g) => g.name);

  const filteredDrugs = drugNames.filter((drug) =>
    drug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredGenes = geneNames.filter((gene) =>
    gene.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDrugSearch = (drug?: string) => {
    const searchTerm = drug || searchQuery;
    setSearchedDrug(searchTerm.toLowerCase());
    setSearchedGene(null);
    setSearchQuery(
      drugDatabase[searchTerm.toLowerCase()]?.drugName || searchTerm,
    );
    setShowSuggestions(false);
  };

  const handleGeneSearch = (gene?: string) => {
    const searchTerm = gene || searchQuery;
    const matchedGene = geneNames.find(
      (g) => g.toLowerCase() === searchTerm.toLowerCase(),
    );
    if (matchedGene) {
      setSearchedGene(matchedGene);
      setSearchedDrug(null);
      setSearchQuery(matchedGene);
    }
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (searchMode === "drug") {
      handleDrugSearch();
    } else {
      handleGeneSearch();
    }
  };

  const drugResult = searchedDrug ? drugDatabase[searchedDrug] : null;
  const geneResult = searchedGene
    ? patient.genes.find((g) => g.name === searchedGene)
    : null;
  const relatedDrugs = searchedGene ? geneToDrugs[searchedGene] || [] : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-[#718096] hover:text-[#00C9A7] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Link>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2540]">
              {patient.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#718096]">
              <span>ID: {patientId}</span>
              <span>DOB: {patient.dateOfBirth}</span>
              <span>Report: {patient.reportDate}</span>
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
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery) {
                        handleSearch();
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 pr-24 border-[#E2E8F0] bg-white focus:border-[#00C9A7] focus:ring-[#00C9A7]"
                  />
                  <Button
                    onClick={() => handleSearch()}
                    disabled={!searchQuery}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0A2540] text-white hover:bg-[#00C9A7] hover:text-[#00513F] h-8 px-4"
                  >
                    Check
                  </Button>

                  {/* Drug Suggestions */}
                  {showSuggestions &&
                    searchMode === "drug" &&
                    searchQuery &&
                    filteredDrugs.length > 0 &&
                    !searchedDrug && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                        {filteredDrugs.slice(0, 5).map((drug) => (
                          <button
                            key={drug}
                            onClick={() => handleDrugSearch(drug)}
                            className="w-full px-4 py-2 text-left text-sm text-[#1A202C] hover:bg-[#F0FFF4] first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                          >
                            <Pill className="h-3 w-3 text-[#718096]" />
                            {drugDatabase[drug].drugName}
                            <span className="ml-auto text-xs text-[#718096]">
                              {drugDatabase[drug].gene}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Gene Suggestions */}
                  {showSuggestions &&
                    searchMode === "gene" &&
                    searchQuery &&
                    filteredGenes.length > 0 &&
                    !searchedGene && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
                        {filteredGenes.map((gene) => {
                          const geneData = patient.genes.find(
                            (g) => g.name === gene,
                          );
                          return (
                            <button
                              key={gene}
                              onClick={() => handleGeneSearch(gene)}
                              className="w-full px-4 py-2 text-left text-sm text-[#1A202C] hover:bg-[#F0FFF4] first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                            >
                              <Dna className="h-3 w-3 text-[#718096]" />
                              {gene}
                              <span className="ml-auto text-xs text-[#718096]">
                                {geneData?.phenotype}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>

                <p className="text-xs text-[#718096]">
                  {searchMode === "drug"
                    ? "Try: Codeine, Tramadol, Warfarin, Simvastatin, Clopidogrel, Omeprazole"
                    : "Try: CYP2D6, CYP2C19, CYP2C9, CYP3A5, SLCO1B1, VKORC1"}
                </p>
              </CardContent>
            </Card>

            {drugResult && <DrugResultCard result={drugResult} />}

            {/* Gene Search Results */}
            {geneResult && (
              <Card className="border-[#E2E8F0] bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-[#0A2540]">
                    <Dna className="h-5 w-5 text-[#00C9A7]" />
                    {geneResult.name} Results
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
                    {geneResult.activityScore && (
                      <div className="rounded-lg bg-[#F7FAFC] p-4 sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
                          Activity Score
                        </p>
                        <p className="mt-1 text-lg font-semibold text-[#0A2540]">
                          {geneResult.activityScore}
                        </p>
                      </div>
                    )}
                  </div>

                  {relatedDrugs.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-[#0A2540]">
                        Related Medications Affected by {geneResult.name}
                      </h3>
                      <div className="space-y-2">
                        {relatedDrugs.map((drugKey) => {
                          const drug = drugDatabase[drugKey];
                          if (!drug) return null;
                          return (
                            <button
                              key={drugKey}
                              onClick={() => {
                                setSearchMode("drug");
                                setSearchQuery(drug.drugName);
                                handleDrugSearch(drugKey);
                              }}
                              className="flex w-full items-center justify-between rounded-lg border border-[#E2E8F0] bg-white p-3 text-left transition-colors hover:border-[#00C9A7] hover:bg-[#F0FFF4]"
                            >
                              <div className="flex items-center gap-3">
                                <Pill className="h-4 w-4 text-[#718096]" />
                                <span className="font-medium text-[#1A202C]">
                                  {drug.drugName}
                                </span>
                              </div>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  drug.severity === "avoid"
                                    ? "bg-[#FFF5F5] text-[#9B2C2C]"
                                    : drug.severity === "caution"
                                      ? "bg-[#FFFFF0] text-[#744210]"
                                      : drug.severity === "safe"
                                        ? "bg-[#F0FFF4] text-[#00513F]"
                                        : "bg-[#F7FAFC] text-[#718096]"
                                }`}
                              >
                                {drug.severity.toUpperCase()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {searchedDrug && !drugResult && (
              <Card className="border-[#718096] bg-[#F7FAFC]">
                <CardContent className="py-8 text-center">
                  <p className="text-[#718096]">
                    No pharmacogenomic data available for "{searchQuery}".
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
                    No results found for gene "{searchQuery}".
                  </p>
                  <p className="mt-2 text-sm text-[#718096]">
                    This gene may not be in the patient's PGx report.
                  </p>
                </CardContent>
              </Card>
            )}

            {!searchedDrug && !searchedGene && (
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
                    : "Enter a gene name to view the patient's phenotype and related medications"}
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.genes.map((gene) => (
                  <GeneCard key={gene.name} gene={gene} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
