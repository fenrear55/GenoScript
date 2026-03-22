const CPIC_BASE = "https://api.cpicpgx.org/v1";

export async function getDrugNameById(drugid: string) {
  const res = await fetch(
    `${CPIC_BASE}/drug?drugid=eq.${encodeURIComponent(drugid)}`,
  );
  const data = await res.json();
  return data[0]?.name ?? drugid; // fallback to drugid if not found
}

export async function getDrugInfo(drugName: string) {
  const res = await fetch(
    `${CPIC_BASE}/drug?name=eq.${drugName.toLowerCase()}`,
  );
  const data = await res.json();
  if (!data.length) return null;
  return {
    drugid: data[0].drugid,
    guidelineid: data[0].guidelineid,
    name: data[0].name,
    flowchart: data[0].flowchart,
  };
}

// 2. Get all recommendations for a guideline
//    and extract which genes the drug actually needs
//    Input:  guidelineid (100416), drugid ("RxNorm:2670")
//    Output: ["CYP2D6"]

export async function getRelevantGenes(guidelineid: number, drugid: string) {
  const res = await fetch(
    `${CPIC_BASE}/recommendation?guidelineid=eq.${guidelineid}`,
  );
  const recs = await res.json();

  // filter to only this specific drug, not siblings in the guideline
  const drugRecs = recs.filter((r) => r.drugid === drugid);

  // extract unique gene names from phenotypes field
  const genes = new Set();
  drugRecs.forEach((r) => {
    Object.keys(r.phenotypes).forEach((gene) => genes.add(gene));
  });

  return [...genes]; // e.g. ["CYP2D6"]
}

// 3. Check which of those genes exist in the patient report
//    Input:  relevantGenes ["CYP2D6"],
//            patientGenes [{ gene, phenotype, plainEnglish }]
//    Output: { matched: { CYP2D6: "Poor Metabolizer" },
//              missing: ["CYP2C19"] }
// ─────────────────────────────────────────
export function matchPatientGenes(relevantGenes, patientGenes) {
  const matched = {};
  const missing: any = [];

  relevantGenes.forEach((gene) => {
    const found = patientGenes.find((g) => g.gene === gene);
    if (found) {
      matched[gene] = found.phenotype;
    } else {
      missing.push(gene);
    }
  });

  return { matched, missing };
}

// ─────────────────────────────────────────
// 4. Get the flag result for this drug + patient phenotype
//    Input:  guidelineid, drugid,
//            matched { CYP2D6: "Poor Metabolizer" }
//    Output: { severity, recommendation, implication,
//              classification, genesInvolved }
// ─────────────────────────────────────────
export async function getFlagResult(
  guidelineid: number,
  drugid: string,
  matched: Record<string, string>,
) {
  if (!Object.keys(matched).length) {
    return {
      severity: "gray",
      recommendation: "No genetic data available for this drug.",
      implication: null,
      classification: "No Recommendation",
      genesInvolved: [],
    };
  }

  const res = await fetch(
    `${CPIC_BASE}/recommendation?guidelineid=eq.${guidelineid}`,
  );
  const recs = await res.json();
  const drugRecs = recs.filter((r) => r.drugid === drugid);

  const match = drugRecs.find((rec) => {
    return Object.entries(rec.phenotypes).every(([gene, phenotype]) => {
      return matched[gene] === phenotype;
    });
  });

  if (!match) {
    return {
      severity: "gray",
      recommendation: "No matching recommendation found for this genotype.",
      implication: null,
      classification: "No Recommendation",
      genesInvolved: [],
    };
  }

  const recText = match.drugrecommendation.toLowerCase();
  let severity;

  if (match.classification === "Strong" && recText.includes("avoid")) {
    severity = "red";
  } else if (
    match.classification === "Moderate" ||
    match.classification === "Optional"
  ) {
    severity = "yellow";
  } else if (match.classification === "Strong" && recText.includes("use")) {
    severity = "green";
  } else if (match.classification === "No Recommendation") {
    severity = "gray";
  } else {
    severity = "yellow";
  }

  // build genesInvolved with full details not just name
  const genesInvolved = Object.entries(match.phenotypes).map(
    ([gene, phenotype]) => ({
      gene,
      phenotype, // e.g. "Poor Metabolizer"
      patientValue: matched[gene], // what this specific patient has
    }),
  );

  return {
    severity,
    recommendation: match.drugrecommendation,
    implication: Object.values(match.implications)[0],
    classification: match.classification,
    genesInvolved, // now has full gene + phenotype info
  };
}

// ─────────────────────────────────────────
// 5. Get alternatives — sibling drugs in same guideline
//    Input:  guidelineid, drugid (the one to exclude),
//            matched { CYP2D6: "Poor Metabolizer" }
//    Output: [{ drugid, severity, recommendation }]
// ─────────────────────────────────────────
interface AlternativeDrug {
  drugid: string;
  drugName: string;
  severity: string;
  recommendation: string;
  classification: string;
}

export async function getAlternatives(
  guidelineid: number,
  drugid: string,
  matched: Record<string, string>,
) {
  const res = await fetch(
    `${CPIC_BASE}/recommendation?guidelineid=eq.${guidelineid}`,
  );
  const recs = await res.json();

  const siblingIds = [
    ...new Set<string>(
      recs.filter((r: any) => r.drugid !== drugid).map((r: any) => r.drugid),
    ),
  ];

  const results: AlternativeDrug[] = []; // ← typed array fixes the error

  for (const sibId of siblingIds) {
    const sibRecs = recs.filter((r: any) => r.drugid === sibId);

    const match = sibRecs.find((rec: any) => {
      return Object.entries(rec.phenotypes).every(([gene, phenotype]) => {
        return matched[gene] === phenotype;
      });
    });

    if (!match) continue;

    const recText = (match as any).drugrecommendation.toLowerCase();
    let severity = "gray";
    if ((match as any).classification === "Strong" && recText.includes("avoid"))
      severity = "red";
    else if (
      (match as any).classification === "Moderate" ||
      (match as any).classification === "Optional"
    )
      severity = "yellow";
    else if (
      (match as any).classification === "Strong" &&
      recText.includes("use")
    )
      severity = "green";

    const nameRes = await fetch(
      `${CPIC_BASE}/drug?drugid=eq.${encodeURIComponent(sibId)}`,
    );
    const nameData = await nameRes.json();
    const drugName = nameData[0]?.name ?? sibId;

    results.push({
      drugid: sibId,
      drugName,
      severity,
      recommendation: (match as any).drugrecommendation,
      classification: (match as any).classification,
    });
  }

  return results;
}

export async function checkDrugForPatient(drugName, patientGenes) {
  // step 1 — drug not in CPIC at all
  const drug = await getDrugInfo(drugName);
  if (!drug) {
    return {
      severity: "gray",
      reason: "not_in_cpic",
      message: `CPIC has no published guideline for ${drugName}.`,
      drug: drugName,
      relevantGenes: [],
      missing: [],
      alternatives: [],
    };
  }

  // step 2 — which genes does this drug need
  const relevantGenes = await getRelevantGenes(drug.guidelineid, drug.drugid);

  // step 3 — check patient has those genes
  const { matched, missing } = matchPatientGenes(relevantGenes, patientGenes);

  // step 4 — patient missing relevant genes
  if (missing.length > 0 && Object.keys(matched).length === 0) {
    return {
      severity: "gray",
      reason: "missing_genes",
      message: `This patient has not been tested for ${missing.join(", ")}, which significantly affects ${drugName} metabolism. Consider ordering a PGx panel that includes ${missing.join(", ")}.`,
      drug: drug.name,
      flowchart: drug.flowchart,
      relevantGenes,
      missing,
      alternatives: [],
    };
  }

  // step 5 — get the flag
  const flag = await getFlagResult(drug.guidelineid, drug.drugid, matched);

  // step 6 — no matching row found
  if (!flag || flag.severity === "gray") {
    return {
      severity: "gray",
      reason: "no_match",
      message: `No specific CPIC recommendation found for this patient's genotype combination with ${drugName}.`,
      drug: drug.name,
      flowchart: drug.flowchart,
      relevantGenes,
      missing,
      alternatives: [],
    };
  }

  // step 7 — get alternatives
  const alternatives = await getAlternatives(
    drug.guidelineid,
    drug.drugid,
    matched,
  );

  return {
    drug: drug.name,
    flowchart: drug.flowchart,
    relevantGenes,
    missing,
    ...flag,
    alternatives,
  };
}
