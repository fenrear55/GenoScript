import mongoose, { Document, Schema } from 'mongoose';

// Define the Patient interface
export interface IPatient extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    dob: string;  // Date string
    createdAt: Date;
}

// Create the Patient Schema
const PatientSchema: Schema = new Schema({
    _id: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }  // Set default to current date
});

// Create the Patient model
const Patient = mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
