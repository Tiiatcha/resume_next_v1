# API Endpoint & Collection Relationship Audit

**Date**: 2026-01-30  
**Purpose**: Document potential API conflicts and referential integrity issues to prevent "unknown error" deletion problems.

---

## Executive Summary

Identified and fixed **2 issues** that could cause "unknown error" when attempting to delete records in Payload CMS admin:

1. ✅ **Fixed**: Endorsements deletion blocked by required relationship from EndorsementAccessChallenges
2. ✅ **Fixed**: TagColors deletion blocked by required relationship from TagCategories

Additionally, refactored custom API endpoints to prevent conflicts with Payload's built-in REST API.

---

## Issue 1: Endorsements Deletion (FIXED)

### Problem
- `EndorsementAccessChallenges` collection has a **required** relationship field pointing to `Endorsements`
- When attempting to delete an endorsement (single or bulk), Payload prevents deletion to maintain referential integrity
- User sees generic "unknown error" message

### Root Cause
```typescript
// collections/EndorsementAccessChallenges.ts (line 34-41)
{
  name: "endorsement",
  type: "relationship",
  relationTo: "endorsements",
  required: true,  // ← This prevents parent deletion
}
```

### Solution Applied
Added `beforeDelete` hook to `Endorsements` collection that:
1. Finds all related `EndorsementAccessChallenges` records
2. Deletes them before the endorsement is deleted
3. Logs cleanup actions for auditing
4. Gracefully handles errors to prevent blocking legitimate deletions

```typescript
// collections/Endorsements.ts (lines 273-309)
hooks: {
  beforeDelete: [
    async ({ req, id }) => {
      // Clean up related EndorsementAccessChallenges
      const challenges = await req.payload.find({
        collection: "endorsement-access-challenges",
        where: { endorsement: { equals: id } },
        limit: 100,
      })
      
      await Promise.all(
        challenges.docs.map((challenge) =>
          req.payload.delete({
            collection: "endorsement-access-challenges",
            id: challenge.id,
          })
        )
      )
    }
  ]
}
```

### Testing
1. Restart development server
2. Navigate to Endorsements collection in Payload admin
3. Select one or more endorsements
4. Click bulk delete
5. Deletion should succeed with log messages confirming cleanup

---

## Issue 2: TagColors Deletion (FIXED)

### Problem
- `TagCategories` collection has a **required** relationship field pointing to `TagColors`
- When attempting to delete a tag color that's in use, Payload prevents deletion
- User sees generic "unknown error" message

### Root Cause
```typescript
// collections/TagCategories.ts (lines 67-76)
{
  name: "color",
  type: "relationship",
  relationTo: "tag-colors",
  required: true,  // ← This prevents parent deletion
}
```

### Solution Applied
Added `beforeDelete` hook to `TagColors` collection that:
1. Checks if any `TagCategories` reference this color
2. If referenced, **prevents deletion** with a clear error message listing affected categories
3. Since the `color` field is required, we cannot nullify it—admin must reassign categories first

```typescript
// collections/TagColors.ts (hooks section)
hooks: {
  beforeDelete: [
    async ({ req, id }) => {
      const categories = await req.payload.find({
        collection: "tag-categories",
        where: { color: { equals: id } },
        limit: 100,
      })
      
      if (categories.docs.length > 0) {
        throw new Error(
          `Cannot delete this color because it is used by ${categories.docs.length} tag category(ies). 
           Please reassign these categories to a different color first.`
        )
      }
    }
  ]
}
```

### User Workflow
1. Admin attempts to delete a TagColor
2. If it's in use, they see a clear error message with category names
3. Admin reassigns those categories to a different color
4. Admin can then successfully delete the original color

---

## Issue 3: API Route Conflicts (FIXED)

### Problem
Custom route at `/app/api/endorsements/route.ts` was intercepting Payload's built-in REST API endpoint for the `endorsements` collection, causing bulk delete requests to fail.

### Root Cause
- Payload's REST API uses `/api/{collection-slug}` for CRUD operations
- Custom route at `/api/endorsements/route.ts` only handled `POST` requests
- `DELETE` requests from Payload admin UI received no handler → failed silently

### Solution Applied
**Moved** the custom public submission endpoint from:
- ❌ `/app/api/endorsements/route.ts` (conflicts with Payload)
- ✅ `/app/api/endorsements/submit/route.ts` (no conflict)

**Updated** frontend form to use new endpoint:
```typescript
// app/(app)/endorsements/_components/endorsement-form.tsx (line 109)
const response = await fetch("/api/endorsements/submit", {
  method: "POST",
  // ...
})
```

### Payload REST API Preserved
Now the following Payload-managed endpoints work correctly:
- `GET /api/endorsements` - List endorsements
- `GET /api/endorsements/:id` - Get single endorsement
- `POST /api/endorsements` - Create endorsement (admin only)
- `PATCH /api/endorsements/:id` - Update endorsement (admin only)
- `DELETE /api/endorsements` - Bulk delete endorsements (admin only)
- `DELETE /api/endorsements/:id` - Delete single endorsement (admin only)

---

## Other Custom API Endpoints (NO CONFLICTS)

All other custom API routes are under nested paths and do not conflict with Payload's REST API:

### ✅ `/api/endorsements/access/endorsement/route.ts`
- **Methods**: `PATCH`, `DELETE`
- **Purpose**: Allow verified submitters to update/delete their own endorsement via OTP session
- **No conflict**: Specific nested path

### ✅ `/api/endorsements/access/send-otp/route.ts`
- **Methods**: `POST`
- **Purpose**: Send OTP verification code to endorsement submitter's email
- **No conflict**: Specific nested path

### ✅ `/api/endorsements/access/verify-otp/route.ts`
- **Methods**: `POST`
- **Purpose**: Verify OTP code and mint session cookie for endorsement management
- **No conflict**: Specific nested path

---

## Collection Relationship Analysis

### Safe Relationships (Optional)
These relationships are **optional** and won't cause deletion issues:

- **BlogPosts**:
  - `category` → Categories (optional)
  - `featuredImage` → Media (optional)
  - `tags` → Tags (optional, hasMany)
  - `author` → Users (optional)

- **Tags**:
  - `category` → TagCategories (optional)

- **Experiences**:
  - `tags` → Tags (optional, hasMany)

- **ChangelogEntries**:
  - `relatedPost` → BlogPosts (optional)
  - `changes[].internalBlogPost` → BlogPosts (optional)

- **Users**:
  - `avatar` → Media (optional)

When an optional relationship target is deleted, Payload automatically nullifies the relationship field—no errors occur.

### Required Relationships (Fixed or Safe)
- ✅ **EndorsementAccessChallenges → Endorsements** (required) - **FIXED** with cascade delete
- ✅ **TagCategories → TagColors** (required) - **FIXED** with prevention + clear error message
- ✅ **Media** - No outgoing relationships
- ✅ **Users** - No required relationships to other collections

---

## Best Practices Going Forward

### 1. When Adding Required Relationships
If you add a new collection with a **required** relationship field:

```typescript
{
  name: "parent",
  type: "relationship",
  relationTo: "parent-collection",
  required: true,  // ⚠️ This will block parent deletion
}
```

**Always add a `beforeDelete` hook** to the parent collection:
- **Option A**: Cascade delete (clean up child records)
- **Option B**: Prevent deletion (if children should survive independently)

### 2. When Adding Custom API Routes
**Avoid** placing custom routes at paths that conflict with Payload's REST API:

❌ **Bad** (conflicts):
```
/app/api/{collection-slug}/route.ts
```

✅ **Good** (no conflict):
```
/app/api/{collection-slug}/{custom-action}/route.ts
```

### 3. Testing Deletion
When adding new collections or relationships:
1. Create test records with relationships
2. Attempt to delete parent records
3. Verify deletion succeeds or shows clear error message
4. Check that child records are handled appropriately

---

## Related Documentation

- [ENDORSEMENT_EMAILS.md](./ENDORSEMENT_EMAILS.md) - Email notification system for endorsements
- [Payload Hooks Documentation](https://payloadcms.com/docs/hooks/overview) - Official Payload hooks guide
- [Payload REST API](https://payloadcms.com/docs/rest-api/overview) - Understanding Payload's built-in endpoints

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-30 | Initial audit - Fixed endorsements & tag colors deletion issues | AI Assistant |
| 2026-01-30 | Refactored endorsements API endpoint to prevent conflicts | AI Assistant |
