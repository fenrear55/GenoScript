import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import patient from "@/models/patient";
import pgxResult from "@/models/pgxResult";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await connectDB();

    const p = await patient.findById(id);

    if (!p) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const pgx = await pgxResult.findOne({ patientId: id });

    return NextResponse.json({
      patient: p,
      pgxReport: pgx ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
