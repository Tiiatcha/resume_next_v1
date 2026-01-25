import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TagList } from "@/components/primitives/tag-list"
import type { ProjectItem } from "@/lib/cv-types"

export function ProjectCard({
  item,
  isActive = false,
  onOpenDetails,
}: {
  item: ProjectItem
  /**
   * True when this card is the currently selected project (used for subtle visual emphasis).
   */
  isActive?: boolean
  /**
   * Opens the side-panel / drawer showing the full project details.
   *
   * If omitted, the card renders in "read-only" mode (no Details button).
   */
  onOpenDetails?: (item: ProjectItem) => void
}) {
  const hasDetails =
    Boolean(item.problem) ||
    Boolean(item.solution) ||
    Boolean(item.management) ||
    Boolean(item.impact) ||
    Boolean(item.contribution)

  return (
    <Card
      className={[
        "bg-card/60 supports-[backdrop-filter]:bg-card/40 transition will-change-transform hover:-translate-y-0.5 hover:shadow-md",
        isActive ? "border-foreground/15 ring-1 ring-foreground/10" : "",
      ].join(" ")}
    >
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <p className="text-muted-foreground text-xs">{item.date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {item.type ? (
            <span className="text-muted-foreground">{item.type}</span>
          ) : null}
          {item.role ? (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{item.role}</span>
            </>
          ) : null}
          {item.url ? (
            <>
              <span className="text-muted-foreground">•</span>
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
              >
                Visit
                <ExternalLinkIcon className="size-3.5" />
              </Link>
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasDetails && onOpenDetails ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              Full write-up available
            </p>
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => onOpenDetails(item)}
            >
              View details
            </Button>
          </div>
        ) : null}
        <TagList tags={item.tags} />
      </CardContent>
    </Card>
  )
}

