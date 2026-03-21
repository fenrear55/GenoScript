const CPIC_BASE = 'https://api.cpicpgx.org/v1'



export async function getDrugInfo(drugName: string) {
  const res = await fetch(`${CPIC_BASE}/drug?name=eq.${drugName.toLowerCase()}`)
  const data = await res.json()
  if (!data.length) return null
  return {
    drugid: data[0].drugid,
    guidelineid: data[0].guidelineid,
    name: data[0].name,
    flowchart: data[0].flowchart
  }
}


// 2. Get all recommendations for a guideline
//    and extract which genes the drug actually needs
//    Input:  guidelineid (100416), drugid ("RxNorm:2670")
//    Output: ["CYP2D6"]

export async function getRelevantGenes(guidelineid, drugid) {
  const res = await fetch(`${CPIC_BASE}/recommendation?guidelineid=eq.${guidelineid}`)
  const recs = await res.json()

  // filter to only this specific drug, not siblings in the guideline
  const drugRecs = recs.filter(r => r.drugid === drugid)

  // extract unique gene names from phenotypes field
  const genes = new Set()
  drugRecs.forEach(r => {
    Object.keys(r.phenotypes).forEach(gene => genes.add(gene))
  })

  return [...genes] // e.g. ["CYP2D6"]
}


// 3. Check which of those genes exist in the patient report
//    Input:  relevantGenes ["CYP2D6"],
//            patientGenes [{ gene, phenotype, plainEnglish }]
//    Output: { matched: { CYP2D6: "Poor Metabolizer" },
//              missing: ["CYP2C19"] }
// ─────────────────────────────────────────
export function matchPatientGenes(relevantGenes, patientGenes) {
  const matched = {}
  const missing: any = []

  relevantGenes.forEach(gene => {
    const found = patientGenes.find(g => g.gene === gene)
    if (found) {
      matched[gene] = found.phenotype
    } else {
      missing.push(gene)
    }
  })

  return { matched, missing }
}

// ─────────────────────────────────────────
// 4. Get the flag result for this drug + patient phenotype
//    Input:  guidelineid, drugid,
//            matched { CYP2D6: "Poor Metabolizer" }
//    Output: { severity, recommendation, implication,
//              classification, genesInvolved }
// ─────────────────────────────────────────
export async function getFlagResult(guidelineid, drugid, matched) {
  // if no matched genes at all, return gray
  if (!Object.keys(matched).length) {
    return {
      severity: 'gray',
      recommendation: 'No genetic data available for this drug.',
      implication: null,
      classification: 'No Recommendation',
      genesInvolved: []
    }
  }

  const res = await fetch(`${CPIC_BASE}/recommendation?guidelineid=eq.${guidelineid}`)
  const recs = await res.json()

  // filter to this drug only
  const drugRecs = recs.filter(r => r.drugid === drugid)

  // find the rec where all phenotypes match the patient
  const match = drugRecs.find(rec => {
    return Object.entries(rec.phenotypes).every(([gene, phenotype]) => {
      return matched[gene] === phenotype
    })
  })

  if (!match) {
    return {
      severity: 'gray',
      recommendation: 'No matching recommendation found for this genotype.',
      implication: null,
      classification: 'No Recommendation',
      genesInvolved: Object.keys(matched)
    }
  }

  // map classification + recommendation text to severity
  const recText = match.drugrecommendation.toLowerCase()
  let severity

  if (match.classification === 'Strong' && recText.includes('avoid')) {
    severity = 'red'
  } else if (match.classification === 'Moderate' || match.classification === 'Optional') {
    severity = 'yellow'
  } else if (match.classification === 'Strong' && recText.includes('use')) {
    severity = 'green'
  } else if (match.classification === 'No Recommendation') {
    severity = 'gray'
  } else {
    severity = 'yellow' // fallback for anything ambiguous
  }

  return {
    severity,
    recommendation: match.drugrecommendation,
    implication: Object.values(match.implications)[0],
    classification: match.classification,
    genesInvolved: Object.keys(match.phenotypes)
  }
}



// ─────────────────────────────────────────
// 5. Get alternatives — sibling drugs in same guideline
//    Input:  guidelineid, drugid (the one to exclude),
//            matched { CYP2D6: "Poor Metabolizer" }
//    Output: [{ drugid, severity, recommendation }]
// ─────────────────────────────────────────
export async function getAlternatives(guidelineid, drugid, matched) {
  const res = await fetch(`${CPIC_BASE}/recommendation?guidelineid=eq.${guidelineid}`)
  const recs = await res.json()

  // get sibling drug ids — everything in guideline except the flagged drug
  const siblingIds = [...new Set(
    recs
      .filter(r => r.drugid !== drugid)
      .map(r => r.drugid)
  )]

  const results: any = []

  siblingIds.forEach(sibId => {
    const sibRecs = recs.filter(r => r.drugid === sibId)

    // find the rec matching this patient's phenotype
    const match = sibRecs.find(rec => {
      return Object.entries(rec.phenotypes).every(([gene, phenotype]) => {
        return matched[gene] === phenotype
      })
    })

    if (!match) return

    const recText = match.drugrecommendation.toLowerCase()
    let severity

    if (match.classification === 'Strong' && recText.includes('avoid')) {
      severity = 'red'
    } else if (match.classification === 'Moderate' || match.classification === 'Optional') {
      severity = 'yellow'
    } else if (match.classification === 'Strong' && recText.includes('use')) {
      severity = 'green'
    } else {
      severity = 'gray'
    }

    results.push({
      drugid: sibId,
      severity,
      recommendation: match.drugrecommendation,
      classification: match.classification
    })
  })

  return results
}






export async function checkDrugForPatient(drugName, patientGenes) {
  // step 1 — what drug is this
  const drug = await getDrugInfo(drugName)
  if (!drug) return { error: 'Drug not found in CPIC database' }

  // step 2 — which genes does this drug care about
  const relevantGenes = await getRelevantGenes(drug.guidelineid, drug.drugid)

  // step 3 — does patient have those genes in their report
  const { matched, missing } = matchPatientGenes(relevantGenes, patientGenes)

  // step 4 — get the flag
  const flag = await getFlagResult(drug.guidelineid, drug.drugid, matched)

  // step 5 — get alternatives from same guideline
  const alternatives = await getAlternatives(drug.guidelineid, drug.drugid, matched)

  return {
    drug: drug.name,
    flowchart: drug.flowchart,
    relevantGenes,
    missing,          // genes the drug needs but patient wasn't tested for
    ...flag,          // severity, recommendation, implication, classification
    alternatives      // sibling drugs with their own severity
  }
}