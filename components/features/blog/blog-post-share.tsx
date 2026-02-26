"use client"

/**
 * Share bar for blog posts: provides share actions for Facebook, X (Twitter),
 * LinkedIn, WhatsApp, and Copy link using the canonical URL for the post.
 */

import type { JSX } from "react"
import { useCallback } from "react"
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
  title,
  excerpt,
}: BlogPostShareProps): JSX.Element {
  const handleCopyLink = useCallback((): void => {
    void navigator.clipboard
      .writeText(canonicalUrl)
      .then(() => {
        toast.success("Link copied to clipboard.")
      })
      .catch(() => {
        toast.error("Clipboard access is not supported. Copy the link manually.")
      })
  }, [canonicalUrl])

  const handleShare = useCallback(
    async (target: ShareTarget): Promise<void> => {
      const shareUrl = buildShareUrl(target, canonicalUrl, title, excerpt)
      // Open using link semantics so browsers prefer a new tab over a popup window.
      const anchor = document.createElement("a")
      anchor.href = shareUrl
      anchor.target = "_blank"
      anchor.rel = "noopener noreferrer"
      anchor.click()
    },
    [canonicalUrl, title, excerpt]
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
