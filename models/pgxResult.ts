// models/pgxResult.ts
import mongoose from "mongoose";

const geneSchema = new mongoose.Schema({
  gene: String,
  diplotype: String,
  phenotype: String,
  plainEnglish: String,
});

const pgxResultSchema = new mongoose.Schema(
  {
    patientId: mongoose.Schema.Types.ObjectId,
    lab: String,
    reportDate: String,
    genes: [geneSchema],
    parsedAt: Date,
  },
  { collection: "pgxresults" },
);

export default mongoose.models.PgxResult ||
  mongoose.model("PgxResult", pgxResultSchema);
