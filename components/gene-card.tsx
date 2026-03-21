import { Card, CardContent } from "@/components/ui/card"

interface Gene {
  name: string
  diplotype: string
  phenotype: string
  activityScore?: string
}

export function GeneCard({ gene }: { gene: Gene }) {
  return (
    <Card className="border-[#E2E8F0] bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
              Gene
            </p>
            <p className="mt-1 text-lg font-bold text-[#0A2540]">{gene.name}</p>
          </div>
          {gene.activityScore && (
            <div className="rounded-full bg-[#F7FAFC] px-3 py-1 text-sm font-medium text-[#718096]">
              AS: {gene.activityScore}
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
              Diplotype
            </p>
            <p className="mt-1 font-mono text-sm text-[#1A202C]">{gene.diplotype}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#718096]">
              Phenotype
            </p>
            <p className="mt-1 text-sm font-medium text-[#1A202C]">{gene.phenotype}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
