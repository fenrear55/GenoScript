import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SeverityBadge } from "@/components/severity-badge"
import { cn } from "@/lib/utils"

type Severity = "avoid" | "caution" | "safe" | "neutral"

interface DrugResult {
  drugName: string
  severity: Severity
  gene: string
  phenotype: string
  recommendation: string
  alternatives?: string[]
  cpicLevel?: string
}

const cardBgColors = {
  avoid: "bg-[#FFF5F5] border-[#E53E3E]",
  caution: "bg-[#FFFFF0] border-[#D69E2E]",
  safe: "bg-[#F0FFF4] border-[#00C9A7]",
  neutral: "bg-[#F7FAFC] border-[#718096]",
}

export function DrugResultCard({ result }: { result: DrugResult }) {
  return (
    <Card className={cn("border-l-4", cardBgColors[result.severity])}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#1A202C]">
              {result.drugName}
            </CardTitle>
            {result.cpicLevel && (
              <p className="mt-1 text-xs text-[#718096]">
                CPIC Level: {result.cpicLevel}
              </p>
            )}
          </div>
          <SeverityBadge severity={result.severity} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
              Gene
            </p>
            <p className="mt-1 font-semibold text-[#1A202C]">{result.gene}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
              Phenotype
            </p>
            <p className="mt-1 font-semibold text-[#1A202C]">{result.phenotype}</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
            Recommendation
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#1A202C]">
            {result.recommendation}
          </p>
        </div>
        
        {result.alternatives && result.alternatives.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
              Alternatives to Consider
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.alternatives.map((alt) => (
                <span
                  key={alt}
                  className="inline-flex items-center rounded-full bg-[#F0FFF4] border border-[#00C9A7] px-3 py-1 text-sm font-medium text-[#00513F]"
                >
                  {alt}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
