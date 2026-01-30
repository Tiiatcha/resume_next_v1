/**
 * Resolve a canonical, absolute site base URL for link generation.
 *
 * Why:
 * - Emails must contain absolute URLs that work in production.
 * - On Vercel, `localhost` fallbacks cause broken links after deployment.
 * - Different runtimes expose request/host info differently, so this function is defensive.
 *
 * Precedence (highest → lowest):
 * - `NEXT_PUBLIC_SITE_URL` (recommended canonical URL, e.g. `https://craigdavison.net`)
 * - `SITE_URL` (optional legacy/canonical URL)
 * - Vercel env hostnames (`VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL`) → `https://<host>`
 * - Request headers (`x-forwarded-proto`, `x-forwarded-host`, `host`)
 * - `http://localhost:3000`
 */

type UnknownRequest = {
  headers?: unknown
  get?: (name: string) => string | undefined
  protocol?: string
} | null

function normaliseBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "")
}

function getHeaderValue(req: UnknownRequest, name: string): string | undefined {
  if (!req) return undefined

  // Express-style helper.
  if (typeof req.get === "function") {
    const value = req.get(name)
    if (value) return value
  }

  const headers = (req as { headers?: unknown }).headers
  if (!headers) return undefined

  // Fetch/undici Headers-like.
  if (typeof (headers as { get?: unknown }).get === "function") {
    const value = (headers as { get: (n: string) => string | null }).get(name)
    if (value) return value
  }

  // Plain object.
  if (typeof headers === "object") {
    const key = name.toLowerCase()
    const record = headers as Record<string, unknown>
    const value = record[name] ?? record[key]
    if (typeof value === "string") return value
    if (Array.isArray(value) && typeof value[0] === "string") return value[0]
  }

  return undefined
}

function getBaseUrlFromRequest(req: UnknownRequest): string | undefined {
  const host =
    getHeaderValue(req, "x-forwarded-host") ?? getHeaderValue(req, "host")
  if (!host) return undefined

  const forwardedProto = getHeaderValue(req, "x-forwarded-proto")
  const protoCandidate =
    forwardedProto?.split(",")[0]?.trim() ||
    (typeof (req as { protocol?: unknown })?.protocol === "string"
      ? (req as { protocol: string }).protocol
      : undefined)

  const protocol = protoCandidate === "http" || protoCandidate === "https" ? protoCandidate : "https"
  return normaliseBaseUrl(`${protocol}://${host}`)
}

export function getSiteBaseUrl(req?: UnknownRequest): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim()
  if (configured) return normaliseBaseUrl(configured)

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProductionHost) return normaliseBaseUrl(`https://${vercelProductionHost}`)

  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) return normaliseBaseUrl(`https://${vercelHost}`)

  const fromReq = getBaseUrlFromRequest(req ?? null)
  if (fromReq) return fromReq

  return "http://localhost:3000"
}

