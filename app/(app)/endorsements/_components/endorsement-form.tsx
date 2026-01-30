'use client'

import * as React from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type { EndorsementRelationshipType } from "./endorsement-types"

interface EndorsementFormState {
  name: string
  email: string
  relationshipType: EndorsementRelationshipType | ""
  roleOrTitle: string
  companyOrProject: string
  linkedinUrl: string
  endorsementText: string
  displayNamePublic: boolean
  displayCompanyPublic: boolean
  displayLinkedInPublic: boolean
  consentToPublish: boolean
  // Honeypot field – real users will never see or fill this.
  honeypot: string
}

interface ApiSuccessResponse {
  success: true
}

interface ApiErrorResponse {
  success: false
  errors: string[]
}

type ApiResponseBody = ApiSuccessResponse | ApiErrorResponse

/**
 * Returns development test data for the endorsement form when enabled via environment variable.
 * This makes testing easier by pre-filling the form with realistic data in development.
 * 
 * @returns Test data object if NEXT_PUBLIC_PREFILL_TEST_DATA=true, otherwise empty object
 */
function getDevelopmentTestData(): Partial<EndorsementFormState> {
  const shouldPrefill = process.env.NEXT_PUBLIC_PREFILL_TEST_DATA === "true"
  
  if (!shouldPrefill) {
    return {}
  }

  return {
    name: "Craig Davison",
    email: "craigadavison77@gmail.com",
    relationshipType: "other",
    roleOrTitle: "Honey Badger",
    companyOrProject: "Acme Corp",
    linkedinUrl: "https://www.linkedin.com/in/craig-davison-773aa546/",
    endorsementText: "Craig is an exceptional developer who brings creativity and technical excellence to every project. His ability to solve complex problems while maintaining clean, maintainable code is remarkable. Working with Craig was a pleasure, and I'd jump at the chance to collaborate again. He's the kind of developer every team needs—skilled, reliable, and always thinking about the bigger picture.",
  }
}

const initialFormState: EndorsementFormState = {
  name: "",
  email: "",
  relationshipType: "",
  roleOrTitle: "",
  companyOrProject: "",
  linkedinUrl: "",
  endorsementText: "",
  displayNamePublic: true,
  displayCompanyPublic: true,
  displayLinkedInPublic: false,
  consentToPublish: false,
  honeypot: "",
  // Merge in development test data if enabled
  ...getDevelopmentTestData(),
}

export function EndorsementForm(): React.JSX.Element {
  const [formState, setFormState] = React.useState<EndorsementFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [serverErrors, setServerErrors] = React.useState<string[]>([])

  function updateField<TKey extends keyof EndorsementFormState>(
    key: TKey,
    value: EndorsementFormState[TKey],
  ) {
    setFormState((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerErrors([])

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/endorsements/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email || undefined,
          relationshipType: formState.relationshipType || undefined,
          roleOrTitle: formState.roleOrTitle || undefined,
          companyOrProject: formState.companyOrProject || undefined,
          linkedinUrl: formState.linkedinUrl || undefined,
          endorsementText: formState.endorsementText,
          displayNamePublic: formState.displayNamePublic,
          displayCompanyPublic: formState.displayCompanyPublic,
          displayLinkedInPublic: formState.displayLinkedInPublic,
          consentToPublish: formState.consentToPublish,
          honeypot: formState.honeypot,
        }),
      })

      let responseBody: ApiResponseBody | null = null

      try {
        responseBody = (await response.json()) as ApiResponseBody
      } catch {
        // If the response is not JSON, fall back to a generic error.
        responseBody = null
      }

      if (!response.ok || !responseBody || responseBody.success === false) {
        const errors =
          responseBody && responseBody.success === false && Array.isArray(responseBody.errors)
            ? responseBody.errors
            : ["Something went wrong while submitting your endorsement. Please try again, or contact Craig directly if the issue persists."]

        setServerErrors(errors)
        toast.error("There were issues with your submission. Please review the form.")
        return
      }

      setFormState(initialFormState)
      toast.success(
        "Thank you — your endorsement has been submitted and will appear once it has been reviewed and approved.",
      )
    } catch {
      setServerErrors([
        "We could not reach the server. Please check your connection and try again, or send your endorsement to Craig by email instead.",
      ])
      toast.error("We could not reach the server. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg sm:text-xl">
          Share a short endorsement
        </CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">
          A couple of honest sentences about what it was like to work together is
          incredibly valuable for future employers and clients. Thank you for taking
          the time.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          {/* Honeypot field – hidden from humans, attractive to bots. */}
          <div className="hidden" aria-hidden="true">
            <Label htmlFor="endorsement-honeypot">Middle name</Label>
            <Input
              id="endorsement-honeypot"
              type="text"
              name="middleName"
              autoComplete="off"
              tabIndex={-1}
              value={formState.honeypot}
              onChange={(event) => updateField("honeypot", event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-sm font-medium text-foreground" htmlFor="endorsement-name">
                Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="endorsement-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-sm font-medium text-foreground" htmlFor="endorsement-email">
                Email (never shown publicly)
              </Label>
              <Input
                id="endorsement-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Used only if Craig needs to confirm details or clarify your endorsement.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-sm font-medium text-foreground" htmlFor="endorsement-relationship">
                Relationship<span className="text-destructive">*</span>
              </Label>
              <Select
                value={formState.relationshipType}
                onValueChange={(value) =>
                  updateField("relationshipType", value as EndorsementFormState["relationshipType"])
                }
              >
                <SelectTrigger
                  id="endorsement-relationship"
                  className="w-full"
                >
                  <SelectValue placeholder="Select one..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="directReport">Direct report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-sm font-medium text-foreground" htmlFor="endorsement-role">
                Your role or title (optional)
              </Label>
              <Input
                id="endorsement-role"
                name="roleOrTitle"
                type="text"
                value={formState.roleOrTitle}
                onChange={(event) => updateField("roleOrTitle", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-1">
              <Label
                className="text-sm font-medium text-foreground"
                htmlFor="endorsement-company"
              >
                Company or project (optional)
              </Label>
              <Input
                id="endorsement-company"
                name="companyOrProject"
                type="text"
                value={formState.companyOrProject}
                onChange={(event) => updateField("companyOrProject", event.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <Label
                className="text-sm font-medium text-foreground"
                htmlFor="endorsement-linkedin"
              >
                LinkedIn profile URL (optional)
              </Label>
              <Input
                id="endorsement-linkedin"
                name="linkedinUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={formState.linkedinUrl}
                onChange={(event) => updateField("linkedinUrl", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-sm font-medium text-foreground"
              htmlFor="endorsement-text"
            >
              Endorsement<span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="endorsement-text"
              name="endorsementText"
              required
              value={formState.endorsementText}
              onChange={(event) => updateField("endorsementText", event.target.value)}
              rows={5}
              maxLength={500}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                A couple of sentences about how we worked together, what stood out to you,
                or what you would say to someone thinking about working with me. I may
                lightly edit for spelling and clarity before publishing, but will not
                change the meaning.
              </p>
              <p className="text-muted-foreground text-[10px] tabular-nums">
                {formState.endorsementText.length}/500
              </p>
            </div>
          </div>

          <fieldset className="space-y-3 rounded-md border bg-muted/30 px-3 py-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              What to show publicly
            </legend>

            <div className="space-y-2 text-sm">
              <label className="flex items-start gap-2">
                <Checkbox
                  checked={formState.displayNamePublic}
                  onCheckedChange={(checked) =>
                    updateField("displayNamePublic", Boolean(checked))
                  }
                  className="mt-[1px]"
                />
                <span>
                  Show my <span className="font-medium">name</span> alongside my endorsement.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <Checkbox
                  checked={formState.displayCompanyPublic}
                  onCheckedChange={(checked) =>
                    updateField("displayCompanyPublic", Boolean(checked))
                  }
                  className="mt-[1px]"
                />
                <span>
                  Show my <span className="font-medium">company or project</span> name.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <Checkbox
                  checked={formState.displayLinkedInPublic}
                  onCheckedChange={(checked) =>
                    updateField("displayLinkedInPublic", Boolean(checked))
                  }
                  className="mt-[1px]"
                />
                <span>
                  Show a link to my <span className="font-medium">LinkedIn profile</span>.
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-2 rounded-md border border-dashed bg-muted/20 px-3 py-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Privacy and consent
            </legend>

            <p className="text-muted-foreground text-xs leading-relaxed">
              I will store the details you provide so I can publish your endorsement on
              my personal CV site and contact you if I need to clarify anything.
              I will only show the pieces of information you have chosen above.
              You can ask me to update or remove your endorsement at any time.
            </p>

            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={formState.consentToPublish}
                onCheckedChange={(checked) =>
                  updateField("consentToPublish", Boolean(checked))
                }
                className="mt-[1px]"
              />
              <span>
                I consent to Craig storing my details and publishing my endorsement and
                the selected information on his website.
              </span>
            </label>
          </fieldset>

          {serverErrors.length > 0 ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <p className="font-medium">There were some issues with your submission:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {serverErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Submit endorsement"}
            </Button>
            <p className="text-muted-foreground text-xs">
              Typical time to publish is within a few days.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

