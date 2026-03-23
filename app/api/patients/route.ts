import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import patient from "@/models/patient";
import pgxResult from "@/models/pgxResult";

export async function GET() {
  try {
    await connectDB();
    const patients = await patient.find({});
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      name,
      dob,
      report,
    }: {
      name: string;
      dob: any;
      report: any;
    } = await request.json();

    await connectDB();

    const split = name.split(" ");
    const fname = split[0];
    const lname = split[1];

    // step 1 — create the patient, get the _id back
    const newPatient = await patient.create({
      fname: fname,
      lname: lname,
      dob: dob,
      createdAt: new Date(),
    });

    // step 2 — save the PGx report linked to that patient
    try {
      const pgxDoc = await pgxResult.create({
        patientId: newPatient._id,
        lab: report.lab,
        reportDate: report.reportDate,
        genes: report.variants,
        parsedAt: new Date(),
      });
      console.log("[pgxResult] created:", pgxDoc._id);
    } catch (pgxError) {
      console.error("[pgxResult] FAILED:", pgxError);
      return NextResponse.json(
        { error: "pgxResult failed: " + String(pgxError) },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      patientId: newPatient._id,
    });
  } catch (error) {
    console.error("[patients POST] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
