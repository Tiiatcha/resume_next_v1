import config from "@payload-config"
import { getPayload } from "payload"
import type { Payload } from "payload"

/**
 * Get a singleton Payload client in the Next.js server runtime.
 *
 * Why this exists:
 * - Payload initialization is not free (plugins, config validation, etc.)
 * - Next dev mode can re-run modules frequently
 * - Using a global singleton avoids repeated initialization work
 */
export async function getPayloadClient(): Promise<Payload> {
  const globalPayload = globalThis as unknown as {
    __payloadClient?: Payload
  }

  if (globalPayload.__payloadClient) return globalPayload.__payloadClient

  const payload = await getPayload({ config })
  globalPayload.__payloadClient = payload
  return payload
}

