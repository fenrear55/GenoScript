import { cn } from "@/lib/utils";

type Severity = "red" | "yellow" | "green" | "gray";

const severityConfig = {
  red: {
    bg: "bg-[#FFF5F5]",
    text: "text-[#9B2C2C]",
    border: "border-[#E53E3E]",
    label: "AVOID",
  },
  yellow: {
    bg: "bg-[#FFFFF0]",
    text: "text-[#744210]",
    border: "border-[#D69E2E]",
    label: "CAUTION",
  },
  green: {
    bg: "bg-[#F0FFF4]",
    text: "text-[#00513F]",
    border: "border-[#00C9A7]",
    label: "SAFE",
  },
  gray: {
    bg: "bg-[#F7FAFC]",
    text: "text-[#718096]",
    border: "border-[#718096]",
    label: "NO DATA",
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {config.label}
    </span>
  );
}
