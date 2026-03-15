import type { ReactElement } from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function PetCardSkeleton(): ReactElement {
  return (
    <Card className="gap-0 py-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  )
}

export { PetCardSkeleton }
