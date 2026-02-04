"use client"

/**
 * Payload admin UI component: "Parse from clipboard" button for image attribution.
 *
 * Reads the current clipboard contents and parses them using stock media site
 * patterns. If a site is selected, that site's pattern is tried first; otherwise
 * all sites are tried until one matches. Extracted values are applied to the
 * imageAttribution fields.
 */

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { Button, useConfig, useForm, useFormFields } from "@payloadcms/ui"
import { toast } from "sonner"
import { formatAdminURL } from "payload/shared"
import { parseAttributionFromPattern } from "@/lib/attribution/parse-attribution"
import type { ParsedAttribution } from "@/lib/attribution/parse-attribution"

type StockMediaSite = {
  id: string
  name: string
  url: string
  attributionParsePattern: string
}

type AttributionParseButtonProps = {
  path: string
}

export function AttributionParseButton({ path }: AttributionParseButtonProps) {
  const { dispatchFields, setModified } = useForm()
  const { config } = useConfig()
  const [sites, setSites] = useState<StockMediaSite[]>([])
  const [isParsing, setIsParsing] = useState(false)

  /** Path to imageAttribution group (e.g. "imageAttribution" when path is "imageAttribution.attributionParseTrigger"). */
  const attributionPath = path.includes(".")
    ? path.split(".").slice(0, -1).join(".")
    : "imageAttribution"

  const stockMediaSiteValue = useFormFields(
    useCallback(
      ([fields]) => fields?.["stockMediaSite"]?.value ?? null,
      [],
    ),
  ) as string | { id: string } | null

  const resolvedSiteId =
    typeof stockMediaSiteValue === "object" && stockMediaSiteValue?.id
      ? stockMediaSiteValue.id
      : typeof stockMediaSiteValue === "string"
        ? stockMediaSiteValue
        : null

  const apiUrl =
    config?.routes?.api &&
    formatAdminURL({
      apiRoute: config.routes.api,
      path: "/stock-media-sites",
    })

  useEffect(() => {
    if (!apiUrl) return
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        const docs = data?.docs ?? data ?? []
        setSites(Array.isArray(docs) ? docs : [])
      })
      .catch(() => setSites([]))
  }, [apiUrl])

  const applyParsedResult = useCallback(
    (parsed: ParsedAttribution, site: StockMediaSite) => {
      const updates: Array<{ field: keyof ParsedAttribution; value: string | null }> = [
        { field: "platformName", value: parsed.platformName ?? site.name },
        { field: "platformUrl", value: parsed.platformUrl ?? site.url },
        { field: "artistName", value: parsed.artistName ?? null },
        { field: "artistUrl", value: parsed.artistUrl ?? null },
        { field: "imageUrl", value: parsed.imageUrl ?? null },
      ]

      for (const { field, value } of updates) {
        dispatchFields({
          type: "UPDATE",
          path: `${attributionPath}.${field}`,
          value: value ?? "",
        })
      }
      setModified(true)
    },
    [attributionPath, dispatchFields, setModified],
  )

  const handleParseFromClipboard = useCallback(async () => {
    if (sites.length === 0) {
      toast.error("No stock media sites configured. Add sites in the Stock Media Sites collection.")
      return
    }

    if (!navigator.clipboard?.readText) {
      toast.error("Clipboard access is not supported in this browser. Try Chrome or Edge.")
      return
    }

    setIsParsing(true)
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (!clipboardText.trim()) {
        toast.error("Clipboard is empty. Copy the attribution from the site (e.g. Unsplash), then click again.")
        return
      }

      const siteOrder =
        resolvedSiteId != null
          ? [
              sites.find((s) => String(s.id) === String(resolvedSiteId)),
              ...sites.filter((s) => String(s.id) !== String(resolvedSiteId)),
            ].filter(Boolean) as StockMediaSite[]
          : sites

      for (const site of siteOrder) {
        const parsed = parseAttributionFromPattern(
          clipboardText,
          site.attributionParsePattern,
          {
            platformName: site.name,
            platformUrl: site.url,
          },
        )
        if (parsed) {
          applyParsedResult(parsed, site)
          toast.success(`Attribution parsed from ${site.name}`)
          return
        }
      }

      toast.error(
        "Could not parse clipboard. No matching pattern found. Ensure you have copied the attribution from a supported site and that a site is selected or patterns are configured.",
      )
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        toast.error(
          "Clipboard access denied. If your browser shows a permission prompt, click Allow. Or check your browser/OS clipboard permissions.",
        )
      } else {
        toast.error("Could not read clipboard. Ensure you're on HTTPS and your browser allows clipboard access.")
        console.warn("[AttributionParseButton] Clipboard error:", err)
      }
    } finally {
      setIsParsing(false)
    }
  }, [sites, resolvedSiteId, applyParsedResult])

  return (
    <Button
      buttonStyle="secondary"
      size="small"
      onClick={handleParseFromClipboard}
      disabled={isParsing}
    >
      {isParsing ? "Parsing…" : "Parse from clipboard"}
    </Button>
  )
}
