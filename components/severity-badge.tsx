import { cn } from "@/lib/utils"

type Severity = "avoid" | "caution" | "safe" | "neutral"

const severityConfig = {
  avoid: {
    bg: "bg-[#FFF5F5]",
    text: "text-[#9B2C2C]",
    border: "border-[#E53E3E]",
    label: "AVOID",
  },
  caution: {
    bg: "bg-[#FFFFF0]",
    text: "text-[#744210]",
    border: "border-[#D69E2E]",
    label: "CAUTION",
  },
  safe: {
    bg: "bg-[#F0FFF4]",
    text: "text-[#00513F]",
    border: "border-[#00C9A7]",
    label: "SAFE",
  },
  neutral: {
    bg: "bg-[#F7FAFC]",
    text: "text-[#718096]",
    border: "border-[#718096]",
    label: "NO DATA",
  },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity]
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.bg,
        config.text,
        config.border
      )}
    >
      {config.label}
    </span>
  )
}
