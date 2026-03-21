import mongoose, { Schema, Document } from 'mongoose';

interface IPgxResult extends Document {
    patientId: mongoose.Types.ObjectId;
    gene: string;
    diplotype: string;
    phenotype: string;
    rawReport: string;
    parsedAt: Date;
}

const PgxResultSchema: Schema = new Schema({
    patientId: { type: mongoose.Types.ObjectId, ref: 'Patient', required: true },
    gene: { type: String, required: true },
    diplotype: { type: String, required: true },
    phenotype: { type: String, required: true },
    rawReport: { type: String, required: true },
    parsedAt: { type: Date, default: Date.now }  // Will use the date when the record is created
});

const PgxResult = mongoose.model<IPgxResult>('PgxResult', PgxResultSchema);

export default PgxResult;