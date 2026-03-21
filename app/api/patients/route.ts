import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import patient from "@/models/patient";

export async function GET() {
  try {
    await connectDB();
    const patients = await patient.find({});
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
