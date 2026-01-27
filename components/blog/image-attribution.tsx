import * as React from "react"

type ImageAttribution = {
  platformName?: string | null
  platformUrl?: string | null
  artistName?: string | null
  artistUrl?: string | null
  imageUrl?: string | null
}

function hasAnyAttributionValue(attribution: ImageAttribution | null | undefined): boolean {
  if (!attribution) return false
  return Boolean(
    attribution.platformName ||
      attribution.platformUrl ||
      attribution.artistName ||
      attribution.artistUrl ||
      attribution.imageUrl,
  )
}

function ExternalLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-4 hover:no-underline"
    >
      {children}
    </a>
  )
}

/**
 * Subtle image attribution line for stock/third-party images.
 *
 * Example output:
 * “Photo by Glenn Carstens-Peters on Unsplash · View image”
 */
export function ImageAttribution({
  attribution,
  className,
}: {
  attribution: ImageAttribution | null | undefined
  className?: string
}) {
  if (!hasAnyAttributionValue(attribution)) return null

  const platformLabel = attribution?.platformName?.trim() || "Source"
  const artistLabel = attribution?.artistName?.trim() || "Artist"

  const platformUrl = attribution?.platformUrl?.trim()
  const artistUrl = attribution?.artistUrl?.trim()
  const imageUrl = attribution?.imageUrl?.trim()

  return (
    <aside
      className={[
        "image-attribution",
        // Subtle, “caption-like” treatment.
        "text-muted-foreground rounded-xl border bg-card/50 px-3 py-2 text-xs",
        "supports-[backdrop-filter]:bg-card/35",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Image attribution"
    >
      <span>
        Photo by{" "}
        {artistUrl ? <ExternalLink href={artistUrl}>{artistLabel}</ExternalLink> : artistLabel}
        {" "}on{" "}
        {platformUrl ? (
          <ExternalLink href={platformUrl}>{platformLabel}</ExternalLink>
        ) : (
          platformLabel
        )}
      </span>

      {imageUrl ? (
        <>
          <span aria-hidden="true">{" · "}</span>
          <ExternalLink href={imageUrl}>View image</ExternalLink>
        </>
      ) : null}
    </aside>
  )
}

