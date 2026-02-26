"use client"

/**
 * Share bar for blog posts: fetches or reuses a short URL and provides
 * share actions for Facebook, X (Twitter), LinkedIn, WhatsApp, and Copy link.
 * Short URL is resolved on first interaction so the link used for sharing
 * and copy is the short form (e.g. site.com/s/abc12).
 */

import type { JSX } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type BlogPostShareProps = {
  /** Full canonical URL of the post (fallback if short URL API fails). */
  canonicalUrl: string
  /** Blog post slug for building /blog/{slug} when requesting short link. */
  slug: string
  /** Post title used in share text. */
  title: string
  /** Optional excerpt for share message body. */
  excerpt?: string
}

type ShareTarget = "facebook" | "x" | "linkedin" | "whatsapp"

function buildShareUrl(target: ShareTarget, url: string, title: string, excerpt?: string): string {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  switch (target) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(
        excerpt ? `${title} — ${excerpt}` : title,
      )}`
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    case "whatsapp": {
      const message = excerpt ? `${title}\n\n${excerpt}\n\n${url}` : `${title} ${url}`
      return `https://wa.me/?text=${encodeURIComponent(message)}`
    }
    default:
      return url
  }
}

export function BlogPostShare({
  canonicalUrl,
  slug,
  title,
  excerpt,
}: BlogPostShareProps): JSX.Element {
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  /** In-flight promise so multiple clicks await the same request. */
  const fetchPromiseRef = useRef<Promise<string> | null>(null)

  /** Resolve short URL (get-or-create) for this post. Uses canonicalUrl if API fails. */
  const getShareUrl = useCallback(async (): Promise<string> => {
    if (shortUrl) return shortUrl
    if (fetchPromiseRef.current) return fetchPromiseRef.current
    const promise = (async (): Promise<string> => {
      try {
        const res = await fetch("/api/short-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/blog/${slug}` }),
        })
        const data = (await res.json()) as { shortUrl?: string; error?: string }
        if (res.ok && typeof data.shortUrl === "string") {
          setShortUrl(data.shortUrl)
          return data.shortUrl
        }
      } catch {
        // Fall through to canonical
      } finally {
        fetchPromiseRef.current = null
      }
      return canonicalUrl
    })()
    fetchPromiseRef.current = promise
    return promise
  }, [canonicalUrl, slug, shortUrl])

  // Pre-generate or fetch the short URL as soon as the component mounts so that
  // the first user interaction can usually use the short link without delay.
  useEffect(() => {
    void getShareUrl()
  }, [getShareUrl])

  const handleCopyLink = useCallback((): void => {
    const urlToCopy = shortUrl ?? canonicalUrl

    void navigator.clipboard
      .writeText(urlToCopy)
      .then(() => {
        toast.success("Link copied to clipboard.")
      })
      .catch(() => {
        toast.error("Clipboard access is not supported. Copy the link manually.")
      })

    // Warm up the short URL in the background so subsequent copies and shares
    // can use the short link without blocking the user gesture.
    if (!shortUrl) {
      void getShareUrl()
    }
  }, [canonicalUrl, shortUrl, getShareUrl])

  const handleShare = useCallback(
    async (target: ShareTarget): Promise<void> => {
      const url = await getShareUrl()
      const shareUrl = buildShareUrl(target, url, title, excerpt)
      // Open using link semantics so browsers prefer a new tab over a popup window.
      const anchor = document.createElement("a")
      anchor.href = shareUrl
      anchor.target = "_blank"
      anchor.rel = "noopener noreferrer"
      anchor.click()
    },
    [getShareUrl, title, excerpt]
  )

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-1 text-sm font-medium">Share</span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => handleShare("facebook")}
                aria-label="Share on Facebook"
              >
                <FaFacebookF className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on Facebook</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => handleShare("x")}
                aria-label="Share on X (Twitter)"
              >
                <FaXTwitter className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on X (Twitter)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => handleShare("linkedin")}
                aria-label="Share on LinkedIn"
              >
                <FaLinkedinIn className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on LinkedIn</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => handleShare("whatsapp")}
                aria-label="Share on WhatsApp"
              >
                <FaWhatsapp className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on WhatsApp</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleCopyLink}
                aria-label="Copy link"
              >
                <CopyIcon className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy share link</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
