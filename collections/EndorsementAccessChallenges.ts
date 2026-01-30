import type { CollectionConfig } from "payload"

/**
 * One-time passcode (OTP) challenges used to grant "accountless" access for
 * endorsement submitters to edit/delete their endorsement.
 *
 * Why this exists:
 * - Endorsement submitters are not registered users in Payload.
 * - The emailed link (`/endorsements/view/[id]`) is a **locator**, not an auth secret.
 * - A forwarded link must NOT be enough to make changes.
 *
 * Security model:
 * - We email a short-lived OTP to the `endorserEmail` stored on the endorsement.
 * - We only store a hash of the OTP (never the raw code).
 * - We enforce expiry + attempt limits + temporary lockouts.
 * - The API uses `overrideAccess: true` but performs its own checks before mutating data.
 */
export const EndorsementAccessChallenges: CollectionConfig = {
  slug: "endorsement-access-challenges",
  admin: {
    hidden: true,
    useAsTitle: "emailNormalized",
    defaultColumns: ["emailNormalized", "expiresAt", "attemptCount", "usedAt", "createdAt"],
  },
  access: {
    // Keep these records private (admin-only).
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "endorsement",
      type: "relationship",
      relationTo: "endorsements",
      required: true,
      admin: {
        description: "The endorsement this OTP challenge is tied to.",
      },
    },
    {
      name: "emailNormalized",
      label: "Email (normalized)",
      type: "text",
      required: true,
      admin: {
        description:
          "Lowercased/trimmed email used for matching and verification. Never display publicly.",
      },
    },
    {
      name: "otpHash",
      label: "OTP hash",
      type: "text",
      required: true,
      admin: {
        description:
          "Hash of the OTP code (never store raw codes). This value is compared server-side only.",
      },
    },
    {
      name: "expiresAt",
      label: "Expires at",
      type: "date",
      required: true,
      admin: {
        description: "When the OTP becomes invalid.",
      },
    },
    {
      name: "usedAt",
      label: "Used at",
      type: "date",
      admin: {
        description:
          "When this OTP was successfully verified. Used OTPs must not be reusable.",
      },
    },
    {
      name: "attemptCount",
      label: "Attempt count",
      type: "number",
      required: true,
      defaultValue: 0,
      admin: {
        description:
          "How many verification attempts have been made for this challenge.",
      },
    },
    {
      name: "lockedUntil",
      label: "Locked until",
      type: "date",
      admin: {
        description:
          "If set, verification attempts should be rejected until this time.",
      },
    },
    {
      name: "lastSentAt",
      label: "Last sent at",
      type: "date",
      admin: {
        description: "When the OTP email was last sent for this challenge.",
      },
    },
    {
      name: "requestMeta",
      label: "Request metadata",
      type: "group",
      admin: {
        description: "Captured for abuse prevention and auditing.",
      },
      fields: [
        { name: "ipAddress", type: "text" },
        { name: "userAgent", type: "text" },
      ],
    },
  ],
}

