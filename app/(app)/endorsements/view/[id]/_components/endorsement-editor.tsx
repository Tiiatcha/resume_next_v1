'use client'

import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type RelationshipType =
  | "client"
  | "colleague"
  | "manager"
  | "directReport"
  | "other"

type DisplayPreferences = Readonly<{
  showNamePublicly?: boolean | null
  showCompanyOrProjectPublicly?: boolean | null
  showLinkedinUrlPublicly?: boolean | null
}>

export type EndorsementEditorData = Readonly<{
  id: string
  status: "pending" | "approved" | "rejected"
  endorserName: string
  endorserEmail: string | null
  relationshipType: RelationshipType
  roleOrTitle: string | null
  companyOrProject: string | null
  linkedinUrl: string | null
  endorsementText: string
  displayPreferences: DisplayPreferences | null
}>

type ApiResponseBody =
  | { success: true }
  | { success: false; errors: string[] }

interface EndorsementEditorProps {
  endorsement: EndorsementEditorData
}

/**
 * Editable endorsement form shown after OTP verification.
 *
 * Design notes:
 * - This form is intentionally separate from the public submission form so we can:
 *   - keep API calls scoped to session-protected endpoints
 *   - prevent accidental edits to immutable fields (email)
 *   - show re-review messaging when a published endorsement changes
 */
export function EndorsementEditor({
  endorsement,
}: EndorsementEditorProps): React.JSX.Element {
  const router = useRouter()

  const preferences = endorsement.displayPreferences ?? {}

  const [endorserName, setEndorserName] = React.useState(endorsement.endorserName)
  const [relationshipType, setRelationshipType] = React.useState<RelationshipType>(
    endorsement.relationshipType,
  )
  const [roleOrTitle, setRoleOrTitle] = React.useState(endorsement.roleOrTitle ?? "")
  const [companyOrProject, setCompanyOrProject] = React.useState(endorsement.companyOrProject ?? "")
  const [linkedinUrl, setLinkedinUrl] = React.useState(endorsement.linkedinUrl ?? "")
  const [endorsementText, setEndorsementText] = React.useState(endorsement.endorsementText)
  const [showNamePublicly, setShowNamePublicly] = React.useState(
    Boolean(preferences.showNamePublicly ?? true),
  )
  const [showCompanyPublicly, setShowCompanyPublicly] = React.useState(
    Boolean(preferences.showCompanyOrProjectPublicly ?? true),
  )
  const [showLinkedinPublicly, setShowLinkedinPublicly] = React.useState(
    Boolean(preferences.showLinkedinUrlPublicly ?? false),
  )

  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleSave(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsSaving(true)
    try {
      const response = await fetch("/api/endorsements/access/endorsement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endorserName,
          relationshipType,
          roleOrTitle,
          companyOrProject,
          linkedinUrl,
          endorsementText,
          displayPreferences: {
            showNamePublicly,
            showCompanyOrProjectPublicly: showCompanyPublicly,
            showLinkedinUrlPublicly: showLinkedinPublicly,
          },
        }),
      })

      const body = (await response.json()) as ApiResponseBody
      if (!response.ok || body.success === false) {
        const errors =
          body.success === false && Array.isArray(body.errors)
            ? body.errors
            : ["We couldn’t save your changes. Please try again."]
        errors.forEach((message) => toast.error(message))
        return
      }

      toast.success("Saved. Your updated endorsement is now under review.")
      router.refresh()
    } catch {
      toast.error("We couldn’t reach the server. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/endorsements/access/endorsement", {
        method: "DELETE",
      })

      const body = (await response.json()) as ApiResponseBody
      if (!response.ok || body.success === false) {
        const errors =
          body.success === false && Array.isArray(body.errors)
            ? body.errors
            : ["We couldn’t delete your endorsement. Please try again."]
        errors.forEach((message) => toast.error(message))
        return
      }

      toast.success("Your endorsement has been deleted.")
      router.push("/endorsements")
      router.refresh()
    } catch {
      toast.error("We couldn’t reach the server. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="bg-card/60 supports-[backdrop-filter]:bg-card/40">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">Edit your endorsement</CardTitle>
          <Badge variant="secondary" className="capitalize">
            {endorsement.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Changes will reset your endorsement to <span className="font-medium">under review</span>{" "}
          so Craig can re-approve it before it’s shown publicly.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSave} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="endorsement-editor-name">
                Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="endorsement-editor-name"
                value={endorserName}
                onChange={(event) => setEndorserName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endorsement-editor-email">Email (read-only)</Label>
              <Input
                id="endorsement-editor-email"
                value={endorsement.endorserEmail ?? ""}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="endorsement-editor-relationship">
                Relationship<span className="text-destructive">*</span>
              </Label>
              <Select
                value={relationshipType}
                onValueChange={(value) => setRelationshipType(value as RelationshipType)}
              >
                <SelectTrigger id="endorsement-editor-relationship">
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

            <div className="space-y-1.5">
              <Label htmlFor="endorsement-editor-role">Your role or title (optional)</Label>
              <Input
                id="endorsement-editor-role"
                value={roleOrTitle}
                onChange={(event) => setRoleOrTitle(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="endorsement-editor-company">Company or project (optional)</Label>
              <Input
                id="endorsement-editor-company"
                value={companyOrProject}
                onChange={(event) => setCompanyOrProject(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endorsement-editor-linkedin">LinkedIn profile URL (optional)</Label>
              <Input
                id="endorsement-editor-linkedin"
                value={linkedinUrl}
                onChange={(event) => setLinkedinUrl(event.target.value)}
                placeholder="https://www.linkedin.com/in/your-profile"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endorsement-editor-text">
              Endorsement<span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="endorsement-editor-text"
              required
              value={endorsementText}
              onChange={(event) => setEndorsementText(event.target.value)}
              rows={6}
              maxLength={500}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-xs">
                Keep it to a couple of honest sentences. Max 500 characters.
              </p>
              <p className="text-muted-foreground text-[10px] tabular-nums">
                {endorsementText.length}/500
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
                  checked={showNamePublicly}
                  onCheckedChange={(checked) => setShowNamePublicly(Boolean(checked))}
                  className="mt-[1px]"
                />
                <span>
                  Show my <span className="font-medium">name</span> alongside my endorsement.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <Checkbox
                  checked={showCompanyPublicly}
                  onCheckedChange={(checked) => setShowCompanyPublicly(Boolean(checked))}
                  className="mt-[1px]"
                />
                <span>
                  Show my <span className="font-medium">company or project</span> name.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <Checkbox
                  checked={showLinkedinPublicly}
                  onCheckedChange={(checked) => setShowLinkedinPublicly(Boolean(checked))}
                  className="mt-[1px]"
                />
                <span>
                  Show a link to my <span className="font-medium">LinkedIn profile</span>.
                </span>
              </label>
            </div>
          </fieldset>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                  Delete endorsement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete your endorsement?</DialogTitle>
                  <DialogDescription>
                    This will permanently remove your endorsement from the site and from Craig’s
                    content system. This can’t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete it"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

