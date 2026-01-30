import type { CollectionConfig } from "payload"
import { render } from "@react-email/components"
import { EndorsementSubmitterEmail } from "../emails/endorsement-submitter"
import { EndorsementAdminEmail } from "../emails/endorsement-admin"
import { EndorsementApprovedEmail } from "../emails/endorsement-approved"
import type { Endorsement } from "../payload-types"
/**
 * Endorsements from clients, colleagues, and managers.
 *
 * Design goals:
 * - **Low-friction submissions**: minimal required fields so people can quickly leave an endorsement.
 * - **Privacy-aware**: email is never exposed publicly; submitters choose which details are shown.
 * - **Moderated publishing**: all entries start as `pending` and must be manually approved.
 */
export const Endorsements: CollectionConfig = {
  slug: "endorsements",
  admin: {
    useAsTitle: "endorserName",
    defaultColumns: ["endorserName", "relationshipType", "status", "createdAt"],
    description:
      "Short endorsements from clients and colleagues. All new submissions start as pending and must be approved before they appear on the site.",
  },
  access: {
    read: ({ req }) => {
      // Anonymous visitors only see approved endorsements.
      // Authenticated admin users can read everything.
      if (req.user) return true

      return {
        status: {
          equals: "approved",
        },
      }
    },
    // Public submissions will go through a custom Next.js route that calls Payload
    // with `overrideAccess: true`. That keeps the REST API surface smaller and
    // lets us add additional protections (rate limiting, honeypot, etc.).
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Only endorsements marked as Approved will be displayed publicly on the site.",
      },
    },
    {
      name: "approvedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description:
          "Timestamp for when this endorsement was approved. Set automatically on first approval, but you can override it.",
      },
    },
    {
      name: "reviewRequest",
      label: "Review request",
      type: "group",
      admin: {
        position: "sidebar",
        description:
          "Metadata describing why this endorsement currently requires review. This is used to drive email copy and admin workflows (new submission vs submitter edit).",
      },
      fields: [
        {
          name: "type",
          label: "Type",
          type: "select",
          required: true,
          defaultValue: "new_submission",
          options: [
            { label: "New submission", value: "new_submission" },
            { label: "Submitter edit", value: "submitter_edit" },
          ],
          admin: {
            description:
              "What triggered the current review cycle. Submitter edits reset endorsements to pending and require re-approval.",
          },
        },
        {
          name: "requestedBy",
          label: "Requested by",
          type: "select",
          required: true,
          defaultValue: "submitter",
          options: [
            { label: "Submitter", value: "submitter" },
            { label: "Admin", value: "admin" },
            { label: "System", value: "system" },
          ],
          admin: {
            description:
              "Who initiated the review request. This is separate from the endorsement `status` field.",
          },
        },
        {
          name: "requestedAt",
          label: "Requested at",
          type: "date",
          admin: {
            description: "When the latest review request was created.",
          },
        },
      ],
    },
    {
      name: "submitterEditAt",
      label: "Submitter edited at",
      type: "date",
      admin: {
        position: "sidebar",
        description:
          "Timestamp of the most recent submitter-driven edit (via OTP self-service). Used to trigger update notification emails.",
      },
    },
    {
      name: "endorserName",
      label: "Name",
      type: "text",
      required: true,
      admin: {
        description:
          "Full name of the person giving the endorsement. They can choose whether this is shown publicly.",
      },
    },
    {
      name: "endorserEmail",
      label: "Email (never shown publicly)",
      type: "email",
      required: false,
      admin: {
        description:
          "Optional contact email used only for verification or clarification. This is never displayed on the public site.",
      },
      access: {
        // Ensure email can only be read inside the admin UI / by authenticated users.
        read: ({ req }) => Boolean(req.user),
      },
    },
    {
      name: "relationshipType",
      label: "Relationship",
      type: "select",
      required: true,
      options: [
        { label: "Client", value: "client" },
        { label: "Colleague", value: "colleague" },
        { label: "Manager", value: "manager" },
        { label: "Direct report", value: "directReport" },
        { label: "Other", value: "other" },
      ],
      admin: {
        description:
          "How this person has worked with you. This helps future employers and clients understand the context.",
      },
    },
    {
      name: "roleOrTitle",
      label: "Role or title (optional)",
      type: "text",
      required: false,
      admin: {
        description:
          "Their role or title at the time you worked together (e.g. Delivery Manager, Product Owner, Lead Developer).",
      },
    },
    {
      name: "companyOrProject",
      label: "Company or project (optional)",
      type: "text",
      required: false,
      admin: {
        description:
          "Company name or project context (e.g. Thames Water transformation programme).",
      },
    },
    {
      name: "linkedinUrl",
      label: "LinkedIn profile URL (optional)",
      type: "text",
      required: false,
      admin: {
        description:
          "Optional LinkedIn profile link to lend extra credibility to the endorsement.",
      },
    },
    {
      name: "endorsementText",
      label: "Endorsement",
      type: "textarea",
      required: true,
      admin: {
        description:
          "2–4 sentences describing what it was like to work with you, focused on impact and reliability. You may lightly edit for clarity and spelling before publishing.",
      },
    },
    {
      name: "displayPreferences",
      label: "Display preferences",
      type: "group",
      admin: {
        description:
          "The submitter can choose which details are shown publicly alongside their endorsement.",
      },
      fields: [
        {
          name: "showNamePublicly",
          label: "Show my name publicly",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "showCompanyOrProjectPublicly",
          label: "Show my company/project publicly",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "showLinkedinUrlPublicly",
          label: "Show my LinkedIn profile link publicly",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
    {
      name: "consentToPublish",
      label: "Consent to publish",
      type: "checkbox",
      required: true,
      admin: {
        description:
          "The submitter must explicitly consent before their endorsement can be published on your site.",
      },
    },
    {
      name: "submissionMeta",
      label: "Submission metadata",
      type: "group",
      admin: {
        position: "sidebar",
        description:
          "Technical metadata captured at submission time (IP, user agent, etc.). Not shown publicly.",
      },
      fields: [
        {
          name: "ipAddress",
          label: "IP address",
          type: "text",
        },
        {
          name: "userAgent",
          label: "User agent",
          type: "text",
        },
      ],
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Clean up any related EndorsementAccessChallenges before deleting the endorsement.
        // This prevents referential integrity issues that would cause "unknown error" in the admin UI.
        try {
          const challenges = await req.payload.find({
            collection: "endorsement-access-challenges",
            where: {
              endorsement: {
                equals: id,
              },
            },
            limit: 100, // Process in batches if there are many
          })

          // Delete all related access challenges
          if (challenges.docs.length > 0) {
            await Promise.all(
              challenges.docs.map((challenge) =>
                req.payload.delete({
                  collection: "endorsement-access-challenges",
                  id: challenge.id,
                }),
              ),
            )
            req.payload.logger.info(
              `Deleted ${challenges.docs.length} related access challenge(s) for endorsement ${id}`,
            )
          }
        } catch (error) {
          req.payload.logger.error(
            `Failed to clean up access challenges for endorsement ${id}: ${error instanceof Error ? error.message : String(error)}`,
          )
          // Don't throw - allow the deletion to proceed even if cleanup fails
        }
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        // When an endorsement is first marked as approved, ensure it has an approval timestamp.
        if (
          data?.status === "approved" &&
          (!originalDoc || originalDoc.status !== "approved") &&
          !data?.approvedAt
        ) {
          return { ...data, approvedAt: new Date().toISOString() }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }): Promise<void> => {
        const BasePayload = req.payload
        const requestUser = req.user
        const resendApiKey = process.env.RESEND_API_KEY
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        const payloadUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || baseUrl

        const currentDoc = doc as Endorsement
        const previous = previousDoc as Endorsement | undefined

        function truncateForEmail(value: string, maxLength: number): string {
          const trimmed = value.trim()
          if (trimmed.length <= maxLength) return trimmed
          return `${trimmed.slice(0, maxLength).trimEnd()}…`
        }

        function buildChangedFieldsSummary(): Array<{
          field: string
          previous: string
          next: string
        }> {
          if (!previous) return []

          const changes: Array<{ field: string; previous: string; next: string }> = []

          const check = (field: string, prevValue: string, nextValue: string) => {
            if (prevValue === nextValue) return
            changes.push({
              field,
              previous: prevValue.length ? prevValue : "(empty)",
              next: nextValue.length ? nextValue : "(empty)",
            })
          }

          check("Name", previous.endorserName ?? "", currentDoc.endorserName ?? "")
          check("Relationship", previous.relationshipType ?? "", currentDoc.relationshipType ?? "")
          check("Role / title", previous.roleOrTitle ?? "", currentDoc.roleOrTitle ?? "")
          check("Company / project", previous.companyOrProject ?? "", currentDoc.companyOrProject ?? "")
          check("LinkedIn URL", previous.linkedinUrl ?? "", currentDoc.linkedinUrl ?? "")
          check(
            "Endorsement",
            truncateForEmail(previous.endorsementText ?? "", 160),
            truncateForEmail(currentDoc.endorsementText ?? "", 160),
          )

          const prevPrefs = previous.displayPreferences ?? {}
          const nextPrefs = currentDoc.displayPreferences ?? {}

          check(
            "Show name publicly",
            String(Boolean(prevPrefs.showNamePublicly ?? true)),
            String(Boolean(nextPrefs.showNamePublicly ?? true)),
          )
          check(
            "Show company/project publicly",
            String(Boolean(prevPrefs.showCompanyOrProjectPublicly ?? true)),
            String(Boolean(nextPrefs.showCompanyOrProjectPublicly ?? true)),
          )
          check(
            "Show LinkedIn publicly",
            String(Boolean(prevPrefs.showLinkedinUrlPublicly ?? false)),
            String(Boolean(nextPrefs.showLinkedinUrlPublicly ?? false)),
          )

          return changes
        }

        const previousStatus =
          previousDoc && typeof previousDoc === "object" && "status" in previousDoc
            ? (previousDoc as { status?: unknown }).status
            : undefined

        const wasApproved = previousStatus === "approved"
        const isApproved = doc.status === "approved"

        const previousSubmitterEditAt = previous?.submitterEditAt ?? null
        const currentSubmitterEditAt = currentDoc.submitterEditAt ?? null
        const hasNewSubmitterEdit =
          operation === "update" &&
          Boolean(currentSubmitterEditAt) &&
          currentSubmitterEditAt !== previousSubmitterEditAt

        const isAdminContext = Boolean(requestUser)
        const submitterOwnedFieldChanges = buildChangedFieldsSummary()
        const hasAdminContentEdits =
          operation === "update" &&
          isAdminContext &&
          submitterOwnedFieldChanges.length > 0 &&
          !hasNewSubmitterEdit

        // On first approval, notify the endorser (if they provided an email).
        // We only do this on update to avoid sending twice when admins create an already-approved record.
        if (operation === "update" && isApproved && !wasApproved) {
          if (!resendApiKey) {
            BasePayload.logger.warn(
              "Skipping endorsement approval email: RESEND_API_KEY not configured",
            )
            return
          }

          if (!doc.endorserEmail) return

          try {
            const approvalVariant =
              currentDoc.reviewRequest?.type === "submitter_edit"
                ? "approved_after_edit"
                : "approved_initial"

            // If an admin edited submitter-owned fields as part of this approval update,
            // send a courtesy notice so the submitter is aware and can adjust if needed.
            if (hasAdminContentEdits) {
              try {
                const noticeHtml = await render(
                  EndorsementSubmitterEmail({
                    variant: "admin_edited_notice",
                    endorserName: currentDoc.endorserName,
                    endorsementText: currentDoc.endorsementText,
                    relationshipType: currentDoc.relationshipType,
                    viewUrl: `${baseUrl}/endorsements/view/${currentDoc.id}`,
                    changedFields: submitterOwnedFieldChanges,
                  }),
                )

                await BasePayload.sendEmail({
                  to: doc.endorserEmail,
                  subject: "An update was made to your endorsement",
                  html: noticeHtml,
                })
              } catch (error) {
                BasePayload.logger.error(
                  `Failed to send admin edit notice to submitter: ${error instanceof Error ? error.message : String(error)}`,
                )
              }
            }

            const html = await render(
              EndorsementApprovedEmail({
                variant: approvalVariant,
                endorserName: doc.endorserName,
                endorsementText: doc.endorsementText,
                relationshipType: doc.relationshipType,
                viewUrl: `${baseUrl}/endorsements/view/${doc.id}`,
                publicUrl: `${baseUrl}/endorsements`,
              }),
            )

            await BasePayload.sendEmail({
              to: doc.endorserEmail,
              subject:
                approvalVariant === "approved_after_edit"
                  ? "Your updated endorsement has been approved"
                  : "Your endorsement has been approved",
              html,
            })
          } catch (error) {
            BasePayload.logger.error(
              `Failed to send endorsement approval email: ${error instanceof Error ? error.message : String(error)}`,
            )
          }

          return
        }

        // If the submitter edited their endorsement (OTP self-service), notify both parties.
        if (hasNewSubmitterEdit) {
          if (!resendApiKey) {
            BasePayload.logger.warn(
              "Skipping endorsement edit email notifications: RESEND_API_KEY not configured",
            )
            return
          }

          const changedFields = submitterOwnedFieldChanges

          // Notify the submitter that we received their update (if email exists).
          if (currentDoc.endorserEmail) {
            try {
              const html = await render(
                EndorsementSubmitterEmail({
                  variant: "updated",
                  endorserName: currentDoc.endorserName,
                  endorsementText: currentDoc.endorsementText,
                  relationshipType: currentDoc.relationshipType,
                  viewUrl: `${baseUrl}/endorsements/view/${currentDoc.id}`,
                }),
              )

              await BasePayload.sendEmail({
                to: currentDoc.endorserEmail,
                subject: "We received your endorsement update",
                html,
              })
            } catch (error) {
              BasePayload.logger.error(
                `Failed to send endorsement update email to submitter: ${error instanceof Error ? error.message : String(error)}`,
              )
            }
          }

          // Notify admin (Craig).
          try {
            const html = await render(
              EndorsementAdminEmail({
                variant: "submitter_updated",
                endorserName: currentDoc.endorserName,
                endorserEmail: currentDoc.endorserEmail ?? undefined,
                endorsementText: currentDoc.endorsementText,
                relationshipType: currentDoc.relationshipType,
                roleOrTitle: currentDoc.roleOrTitle ?? undefined,
                companyOrProject: currentDoc.companyOrProject ?? undefined,
                linkedinUrl: currentDoc.linkedinUrl ?? undefined,
                consentToPublish: currentDoc.consentToPublish,
                displayPreferences: {
                  showNamePublicly: Boolean(currentDoc.displayPreferences?.showNamePublicly ?? true),
                  showCompanyOrProjectPublicly: Boolean(
                    currentDoc.displayPreferences?.showCompanyOrProjectPublicly ?? true,
                  ),
                  showLinkedinUrlPublicly: Boolean(
                    currentDoc.displayPreferences?.showLinkedinUrlPublicly ?? false,
                  ),
                },
                changedFields,
                submissionMeta: currentDoc.submissionMeta
                  ? {
                      ipAddress: currentDoc.submissionMeta.ipAddress ?? undefined,
                      userAgent: currentDoc.submissionMeta.userAgent ?? undefined,
                    }
                  : undefined,
                payloadUrl: payloadUrl,
                documentId: currentDoc.id,
              }),
            )

            await BasePayload.sendEmail({
              to: "craig.davison@ncodein.com", // TODO: Change to your preferred admin address
              subject: `Endorsement updated by ${currentDoc.endorserName}`,
              html,
            })
          } catch (error) {
            BasePayload.logger.error(
              `Failed to send endorsement update email to admin: ${error instanceof Error ? error.message : String(error)}`,
            )
          }

          return
        }

        // If an admin edited submitter-owned fields (without it being a submitter edit),
        // send a courtesy notice to the submitter so they can review/adjust if desired.
        if (hasAdminContentEdits) {
          if (!resendApiKey) {
            BasePayload.logger.warn(
              "Skipping admin edit notice email: RESEND_API_KEY not configured",
            )
            return
          }

          if (!currentDoc.endorserEmail) {
            return
          }

          try {
            const html = await render(
              EndorsementSubmitterEmail({
                variant: "admin_edited_notice",
                endorserName: currentDoc.endorserName,
                endorsementText: currentDoc.endorsementText,
                relationshipType: currentDoc.relationshipType,
                viewUrl: `${baseUrl}/endorsements/view/${currentDoc.id}`,
                changedFields: submitterOwnedFieldChanges,
              }),
            )

            await BasePayload.sendEmail({
              to: currentDoc.endorserEmail,
              subject: "An update was made to your endorsement",
              html,
            })
          } catch (error) {
            BasePayload.logger.error(
              `Failed to send admin edit notice to submitter: ${error instanceof Error ? error.message : String(error)}`,
            )
          }

          return
        }

        // Only send emails on creation (new endorsement submissions)
        if (operation !== "create") return

        // Check if Resend API key is configured
        if (!resendApiKey) {
          BasePayload.logger.warn(
            "Skipping endorsement email notifications: RESEND_API_KEY not configured",
          )
          return
        }

        // Send email to the endorser (if they provided an email)
        // NOTE: Currently sending to test address due to sandbox domain restrictions
        // TODO: Change to doc.endorserEmail when using verified domain
        if (doc.endorserEmail) {
          try {
            const html = await render(
              EndorsementSubmitterEmail({
                variant: "created",
                endorserName: doc.endorserName,
                endorsementText: doc.endorsementText,
                relationshipType: doc.relationshipType,
                viewUrl: `${baseUrl}/endorsements/view/${doc.id}`,
              }),
            )

            await BasePayload.sendEmail({
              to: doc.endorserEmail, // TODO: Change to doc.endorserEmail
              subject: "Thank you for your endorsement",
              html,
            })
          } catch (error) {
            BasePayload.logger.error(
              `Failed to send endorsement notification: ${error instanceof Error ? error.message : String(error)}`,
            )
          }
        }

        // Send email to admin (Craig)
        try {
          const html = await render(
            EndorsementAdminEmail({
              variant: "created",
              endorserName: doc.endorserName,
              endorserEmail: doc.endorserEmail,
              endorsementText: doc.endorsementText,
              relationshipType: doc.relationshipType,
              roleOrTitle: doc.roleOrTitle,
              companyOrProject: doc.companyOrProject,
              linkedinUrl: doc.linkedinUrl,
              consentToPublish: doc.consentToPublish,
              displayPreferences: doc.displayPreferences,
              submissionMeta: doc.submissionMeta
                ? {
                    ipAddress: doc.submissionMeta.ipAddress ?? undefined,
                    userAgent: doc.submissionMeta.userAgent ?? undefined,
                  }
                : undefined,
              payloadUrl: payloadUrl,
              documentId: doc.id,
            }),
          )

          await BasePayload.sendEmail({
            to: "craig.davison@ncodein.com", // TODO: Change to craigadavison77@gmail.com
            subject: `New endorsement from ${doc.endorserName}`,
            html,
          })
        } catch (error) {
          BasePayload.logger.error(
            `Failed to send admin notification: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      },
    ],
  },
  
}

