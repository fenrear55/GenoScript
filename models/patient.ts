import mongoose, { Document, Schema } from "mongoose";

// Define the Patient interface
export interface IPatient extends Document {
  fname: string;
  lname: string;
  dob: string; // Date string
  num_genes: number;
  createdAt: Date;
}

// Create the Patient Schema
const PatientSchema: Schema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  dob: { type: String, required: true },
  num_genes: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }, // Set default to current date
});

// Create the Patient model
const Patient =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
