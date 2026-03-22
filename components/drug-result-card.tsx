import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "red" | "yellow" | "green" | "gray";

interface GeneInvolved {
  gene: string;
  phenotype: string;
  description?: string;
}

interface Alternative {
  drugid: string;
  drugName: string;
  severity: Severity;
}

type GrayReason = "not_in_cpic" | "missing_genes" | "no_match" | undefined;

interface DrugResult {
  drugName: string;
  severity: Severity;
  reason?: GrayReason;
  missing?: string[];
  classification: string;
  implication: string;
  recommendation: string;
  genesInvolved: GeneInvolved[];
  alternatives: Alternative[];
}

const severityConfig = {
  red: {
    badge: "bg-[#FED7D7] text-[#9B2C2C]",
    border: "border-l-[#E53E3E]",
    dot: "bg-[#E53E3E]",
    text: "text-[#E53E3E]",
    label: "Avoid",
    icon: AlertTriangle,
    bgAccent: "bg-red-50/50",
  },
  yellow: {
    badge: "bg-[#FEFCBF] text-[#744210]",
    border: "border-l-[#D69E2E]",
    dot: "bg-[#D69E2E]",
    text: "text-[#D69E2E]",
    label: "Caution",
    icon: AlertCircle,
    bgAccent: "bg-amber-50/50",
  },
  green: {
    badge: "bg-[#C6F6D5] text-[#22543D]",
    border: "border-l-[#00C9A7]",
    dot: "bg-[#00C9A7]",
    text: "text-[#00C9A7]",
    label: "Safe",
    icon: CheckCircle,
    bgAccent: "bg-emerald-50/50",
  },
  gray: {
    badge: "bg-[#E2E8F0] text-[#4A5568]",
    border: "border-l-[#718096]",
    dot: "bg-[#718096]",
    text: "text-[#718096]",
    label: "No Data",
    icon: Info,
    bgAccent: "bg-slate-50/50",
  },
};

export function DrugResultCard({ result }: { result: DrugResult }) {
  const config = severityConfig[result.severity];
  const Icon = config.icon;

  const cpicUrl = `https://cpicpgx.org/guidelines/`;

  return (
    <Card
      className={cn(
        "bg-white border-[#E2E8F0] overflow-hidden border-l-4 shadow-sm",
        config.border,
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div
          className={cn("px-5 py-4 border-b border-[#E2E8F0]", config.bgAccent)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={cn("h-5 w-5", config.text)} />
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  config.badge,
                )}
              >
                {config.label}
              </span>
              <h2 className="text-xl font-semibold text-[#0A2540]">
                {result.drugName}
              </h2>
            </div>
            {result.classification && (
              <span className="rounded-full bg-[#0A2540] px-3 py-1 text-xs font-medium text-white">
                {result.classification}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Implication + Recommendation */}
          <div className="space-y-2">
            <p className="text-[15px] font-semibold leading-snug text-[#1A202C]">
              {result.implication}
            </p>
            <p className="text-sm leading-relaxed text-[#4A5568]">
              {result.recommendation}
            </p>
          </div>

          {/* Gray state messages */}
          {result.severity === "gray" && (
            <div className="rounded-lg border border-[#E2E8F0] bg-[#F7FAFC] px-4 py-3">
              {result.reason === "not_in_cpic" && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#4A5568]">
                    No CPIC guideline exists for this drug
                  </p>
                  <p className="text-xs text-[#718096]">
                    CPIC has not published pharmacogenomic recommendations for
                    this drug. No PGx action is needed.
                  </p>
                </div>
              )}

              {result.reason === "missing_genes" && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#4A5568]">
                    Incomplete genetic data for this drug
                  </p>
                  <p className="text-xs text-[#718096]">
                    This patient has not been tested for{" "}
                    <span className="font-semibold text-[#0A2540]">
                      {result.missing?.join(", ")}
                    </span>
                    , which significantly affects this drug's metabolism.
                  </p>
                  <p className="text-xs text-[#718096]">
                    Consider ordering a PGx panel that includes this drug before
                    prescribing.
                  </p>
                </div>
              )}

              {result.reason === "no_match" && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#4A5568]">
                    No recommendation for this genotype
                  </p>
                  <p className="text-xs text-[#718096]">
                    CPIC has no specific recommendation for this patient's
                    genotype combination with this drug.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Why This Flag Fired */}
          {result.genesInvolved && result.genesInvolved.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Why This Flag Fired
              </p>
              {result.genesInvolved.map((gene) => (
                <div
                  key={gene.gene}
                  className="rounded-lg border border-[#E2E8F0] overflow-hidden bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between bg-[#F7FAFC] px-4 py-2.5 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm",
                          config.dot,
                        )}
                      />
                      <span className="text-sm font-bold text-[#0A2540]">
                        {gene.gene}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <div className="px-4 py-3 border-r border-[#E2E8F0]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0] mb-1">
                        Patient Result
                      </p>
                      <p className="text-sm font-semibold text-[#0A2540]">
                        {gene.phenotype}
                      </p>
                      <span className="inline-flex items-center mt-1.5 rounded-full bg-[#F0FFF4] border border-[#00C9A7]/30 px-2 py-0.5 text-[10px] font-medium text-[#00C9A7]">
                        from PGx report
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0] mb-1">
                        CPIC Matched To
                      </p>
                      <p className="text-sm font-semibold text-[#0A2540]">
                        {gene.phenotype}
                      </p>
                      <span className="inline-flex items-center mt-1.5 rounded-full bg-[#F0FFF4] border border-[#00C9A7]/30 px-2 py-0.5 text-[10px] font-medium text-[#00C9A7]">
                        exact match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                Alternatives in This Guideline
              </p>
              <div className="grid gap-2">
                {result.alternatives.map((alt) => {
                  const altConfig = severityConfig[alt.severity];
                  return (
                    <div
                      key={alt.drugid}
                      className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#FAFAFA] px-4 py-2.5 transition-colors hover:bg-[#F7FAFC]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn("h-2 w-2 rounded-full", altConfig.dot)}
                        />
                        <span className="text-sm font-medium text-[#1A202C]">
                          {alt.drugName}
                        </span>
                      </div>
                      <span
                        className={cn("text-xs font-semibold", altConfig.text)}
                      >
                        {altConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CPIC Link */}
          {cpicUrl && (
            <div className="pt-2 border-t border-[#E2E8F0]">
              <a
                href={cpicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00C9A7] hover:text-[#00A389] transition-colors"
              >
                View CPIC clinical guideline
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
