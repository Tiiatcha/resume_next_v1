import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import {
  ImageAttribution,
  type ImageAttribution as ImageAttributionType,
} from "./image-attribution"

/**
 * Shared helper type describing a media item coming from Payload.
 * This mirrors the generated Media type shape we care about without importing
 * from the generated file, so it stays resilient to future changes.
 */
export type MediaWithOptionalAttribution = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  imageAttribution?: ImageAttributionType | null
}

type ImageScale = "feature" | "content" | "thumbnail"

export type AttributedMediaImageProps = {
  /**
   * Media document from Payload. Ideally includes `imageAttribution` so credits
   * are defined once on the media item and reused everywhere.
   */
  media?: MediaWithOptionalAttribution | null
  /**
   * Optional override for attribution data. This is primarily to support
   * legacy content where attribution lives on the parent document (e.g. blog
   * post) instead of the media item itself.
   */
  attributionOverride?: ImageAttributionType | null
  /**
   * Controls how “large” the image should be treated for attribution UI.
   *
   * - "feature": hero/cover images – get an overlay on desktop and caption on mobile.
   * - "content": inline/content images – caption-only behaviour by default.
   * - "thumbnail": small images – an optional, compact pop-out credit chip.
   */
  scale?: ImageScale
  /**
   * Whether to show the compact pop-out credit chip for thumbnails.
   * Defaults to `true`.
   */
  showThumbnailAttribution?: boolean
  /**
   * Extra classes applied to the outer figure wrapper.
   */
  className?: string
  /**
   * Extra classes applied directly to the underlying Next.js Image element.
   */
  imageClassName?: string
  /**
   * Forwards through to Next.js Image `priority` prop.
   */
  priority?: boolean
}

function hasAnyAttributionValue(
  attribution: ImageAttributionType | null | undefined,
): boolean {
  if (!attribution) return false
  return Boolean(
    attribution.platformName ||
      attribution.platformUrl ||
      attribution.artistName ||
      attribution.artistUrl ||
      attribution.imageUrl,
  )
}

function buildAttributionLabel(attribution: ImageAttributionType): string {
  const platformLabel = attribution.platformName?.trim() || "Source"
  const artistLabel = attribution.artistName?.trim() || "Artist"
  return `Photo by ${artistLabel} on ${platformLabel}`
}

export function AttributedMediaImage({
  media,
  attributionOverride = null,
  scale = "content",
  showThumbnailAttribution = true,
  className,
  imageClassName,
  priority,
}: AttributedMediaImageProps) {
  if (!media || !media.url) return null

  const src = media.url
  const alt = media.alt || ""
  const width = media.width ?? undefined
  const height = media.height ?? undefined

  const attribution = media.imageAttribution ?? attributionOverride ?? null
  const hasAttribution = hasAnyAttributionValue(attribution)

  // Content images: simple figure + optional caption.
  if (scale === "content") {
    return (
      <figure className={cn("space-y-2", className)}>
        <div className="relative overflow-hidden rounded-xl border bg-card/60 supports-[backdrop-filter]:bg-card/40">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn("h-auto w-full object-cover", imageClassName)}
            priority={priority}
          />
        </div>
        {hasAttribution && (
          <ImageAttribution attribution={attribution} className="text-[11px]" />
        )}
      </figure>
    )
  }

  // Thumbnail images: optional compact “credit” chip on larger screens.
  if (scale === "thumbnail") {
    const title =
      attribution && hasAttribution
        ? buildAttributionLabel(attribution)
        : undefined

    return (
      <figure className={cn("relative", className)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("h-auto w-full object-cover rounded-lg", imageClassName)}
          priority={priority}
        />

        {hasAttribution && showThumbnailAttribution && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-1 right-1 hidden rounded-full",
              "bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm",
              "ring-1 ring-border/70 backdrop-blur-sm md:flex md:items-center md:gap-1",
            )}
            aria-label="Image attribution"
            title={title}
          >
            <span aria-hidden="true">ⓘ</span>
            <span className="font-medium">Credit</span>
          </div>
        )}
      </figure>
    )
  }

  // Feature / hero images:
  // - Desktop: overlay attribution in the corner of the image.
  // - Mobile: show attribution as a caption under the image.
  return (
    <figure className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-2xl border bg-card/60 supports-[backdrop-filter]:bg-card/40">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("h-auto w-full object-cover", imageClassName)}
          priority={priority}
        />

        {hasAttribution && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden justify-end md:flex">
            <div className="pointer-events-auto max-w-full">
              <ImageAttribution
                attribution={attribution}
                className={cn(
                  "bg-card/85 text-[11px] shadow-sm ring-1 ring-border/70 backdrop-blur-sm",
                  "max-w-[min(100%,_22rem)]",
                )}
              />
            </div>
          </div>
        )}
      </div>

      {hasAttribution && (
        <div className="md:hidden">
          <ImageAttribution attribution={attribution} className="text-[11px]" />
        </div>
      )}
    </figure>
  )
}

