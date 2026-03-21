import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export interface GeneVariant {
  gene: string;
  diplotype: string;
  phenotype: string;
  plainEnglish: string;
}

export interface PGxReport {
  lab: string;
  reportDate: string;
  variants: GeneVariant[];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function parsePGxReport(file: File): Promise<PGxReport> {
  const base64 = await fileToBase64(file);

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64,
            },
          },
          {
            text: `You are parsing a pharmacogenomics (PGx) lab report. Extract every gene result.

GENE NAME RULES:
- Use only the base gene name with no extra identifiers
- Write "HTR2C" not "5HT2C" — same gene, always use HTR2C
- Write "ABCB1" not "ABCB1 (rs2032583)" or "ABCB1 (rs1045642)"
- If the same gene appears twice with different rs numbers, keep both entries but use just "ABCB1" as the gene name
- Split combined genes: if you see "CYP3A4/5" create two separate entries — one "CYP3A4" and one "CYP3A5"

PHENOTYPE RULES — translate ALL labels into exact CPIC terms:

Metabolizer genes (CYP2D6, CYP2C19, CYP2C9, CYP2B6, CYP3A4, CYP3A5, CYP2C8, NAT2, TPMT, NUDT15, DRD2):
- "Poor Metabolizer"         ← poor, PM, no function, low activity
- "Intermediate Metabolizer" ← intermediate, IM, reduced function
- "Normal Metabolizer"       ← normal, NM, extensive, EM, normal activity
- "Rapid Metabolizer"        ← rapid, RM
- "Ultrarapid Metabolizer"   ← ultrarapid, UM, ultra-rapid, increased function

Function genes (SLCO1B1, ABCG2, UGT1A1, UGT1A4, UGT2B15, ABCB1, DPYD, SLC6A4, MTHFR, OPRM1):
- "Decreased Function"       ← decreased, low, reduced activity
- "Normal Function"          ← normal, extensive, normal activity
- "Increased Function"       ← increased, high, high activity

SLC6A4 specifically:
- L(A)/L(A) diplotype → "Increased Function"
- L(A)/S or S/S diplotype → "Normal Function" or "Decreased Function"
- "High Activity" → "Increased Function"
- "Low Activity" → "Decreased Function"

COMT specifically (Val = HIGH activity, Met = LOW activity):
- Val/Val → "Increased Function"
- Val/Met → "Normal Function"
- Met/Met → "Decreased Function"
- "Normal Activity" for Val/Met → "Normal Function"

MC4R, HTR2A, HTR2C, DRD2, OPRM1 — use closest term:
- "Normal Activity" or "Normal" → "Normal Function"
- "Decreased Response" or "Low Activity" → "Decreased Function"
- "High Risk" or "Increased Activity" → "Increased Function"

HLA genes (HLA-A, HLA-B, HLA-C, HLA-DRB1, HLA-DQA1):
- "Positive"  ← positive, detected, present, increased risk
- "Negative"  ← negative, not detected, absent, normal risk, normal

For any gene not listed above: use the lab's original phenotype label exactly as written.

PLAIN ENGLISH RULES:
- One sentence maximum
- Plain language a non-medical person can understand
- Do not repeat the gene name
- Focus on what it means for how drugs work in this person's body`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lab: { type: Type.STRING },
          reportDate: { type: Type.STRING },
          variants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                gene: { type: Type.STRING },
                diplotype: { type: Type.STRING },
                phenotype: {
                  type: Type.STRING,
                  enum: [
                    "Poor Metabolizer",
                    "Intermediate Metabolizer",
                    "Normal Metabolizer",
                    "Rapid Metabolizer",
                    "Ultrarapid Metabolizer",
                    "Decreased Function",
                    "Normal Function",
                    "Increased Function",
                    "Positive",
                    "Negative",
                    "Indeterminate",
                  ],
                },
                plainEnglish: { type: Type.STRING },
              },
              required: ["gene", "diplotype", "phenotype", "plainEnglish"],
            },
          },
        },
        required: ["lab", "reportDate", "variants"],
      },
    },
  });

  return JSON.parse(result.text!) as PGxReport;
}
