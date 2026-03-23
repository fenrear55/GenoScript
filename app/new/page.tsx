"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parsePGxReport } from "@/lib/parsePGx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function NewPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    patientId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(10);
      const report = await parsePGxReport(file!);
      setUploadProgress(100);
      console.log(report);

      const result = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          dob: formData.dateOfBirth,
          report: report,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error ?? "Failed to save patient");
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push(`/patients/${data.patientId}`);
    } catch (err) {
      console.error("Failed to parse report:", err);
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isFormValid = formData.name && formData.dateOfBirth && file;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A2540]">Add New Patient</h1>
          <p className="mt-1 text-[#718096]">
            Enter patient details and upload their PGx report
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-[#E2E8F0] bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-[#0A2540]">
                Patient Information
              </CardTitle>
              <CardDescription className="text-[#718096]">
                Basic details about the patient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A202C]">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter patient's full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-[#E2E8F0] focus:border-[#00C9A7] focus:ring-[#00C9A7]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A202C]">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="border-[#E2E8F0] focus:border-[#00C9A7] focus:ring-[#00C9A7]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A202C]">
                    Patient ID{" "}
                    <span className="text-[#718096]">(optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., PX-001"
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    className="border-[#E2E8F0] focus:border-[#00C9A7] focus:ring-[#00C9A7]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E2E8F0] bg-white">
            <CardHeader>
              <CardTitle className="text-lg text-[#0A2540]">
                PGx Report
              </CardTitle>
              <CardDescription className="text-[#718096]">
                Upload the pharmacogenomics report PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                    isDragging
                      ? "border-[#00C9A7] bg-[#F0FFF4]"
                      : "border-[#E2E8F0] bg-[#F8F9FA] hover:border-[#00C9A7]",
                  )}
                >
                  <Upload
                    className={cn(
                      "mb-4 h-12 w-12",
                      isDragging ? "text-[#00C9A7]" : "text-[#718096]",
                    )}
                  />
                  <p className="mb-2 text-center text-sm font-medium text-[#1A202C]">
                    Drag and drop your PGx report here
                  </p>
                  <p className="mb-4 text-center text-xs text-[#718096]">
                    or click to browse (PDF only)
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#0A2540] text-[#0A2540] hover:bg-[#0A2540] hover:text-white"
                  >
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-[#00C9A7] bg-[#F0FFF4] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00C9A7]">
                      <FileText className="h-5 w-5 text-[#00513F]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1A202C]">{file.name}</p>
                      <p className="text-sm text-[#718096]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="text-[#718096] hover:text-[#E53E3E]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isUploading && (
            <Card className="border-[#00C9A7] bg-[#F0FFF4]">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  {uploadProgress < 100 ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#00C9A7]" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-[#00C9A7]" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-[#00513F]">
                      {uploadProgress < 100
                        ? "Analyzing PGx report..."
                        : "Report processed successfully!"}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#00C9A7]/20">
                      <div
                        className="h-full bg-[#00C9A7] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="border-[#E2E8F0] text-[#718096] hover:bg-[#F8F9FA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isUploading}
              className="bg-[#0A2540] text-white hover:bg-[#00C9A7] hover:text-[#00513F] disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Patient"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
