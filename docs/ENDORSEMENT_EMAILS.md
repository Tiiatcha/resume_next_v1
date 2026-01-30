# Endorsement Email Notifications

This document describes the email notification system for endorsement submissions.

## Overview

When someone submits an endorsement through the public form, the system automatically sends two emails:

1. **Confirmation email to the submitter** (if they provided an email address)
2. **Notification email to the site admin** (Craig)

## Features

### Submitter Email

The confirmation email sent to the person who submitted the endorsement includes:

- **Thank you message** with personalized greeting
- **Preview of their endorsement** showing what they submitted
- **Current status** (pending review)
- **View link** to a dedicated page where they can see their endorsement details
- **Beautifully styled design** matching the site's aesthetic with:
  - Gradient header with modern colors
  - Clean, card-based layout
  - Responsive design for all devices
  - Professional typography

### Admin Email

The notification email sent to Craig includes:

- **Complete endorsement details**:
  - Endorser name, email, relationship type
  - Role/title and company/project (if provided)
  - LinkedIn profile (if provided)
  - Full endorsement text
- **Display preferences** showing what the submitter chose to make public
- **Consent status** for publishing
- **Submission metadata** (IP address, user agent for security/spam prevention)
- **Direct link to Payload CMS** for quick review and approval
- **Information-dense design** optimized for efficient review

## Technical Implementation

### Email Templates

Two React component email templates are located in the `/emails` directory:

- `endorsement-submitter-notification.tsx` - Sent to the endorsement submitter
- `endorsement-admin-notification.tsx` - Sent to the site admin

Both templates use inline CSS styles for maximum email client compatibility and feature:
- Modern, accessible design
- Responsive layouts using tables (email standard)
- Consistent color scheme matching the site
- Clear hierarchy and typography

### Hook Implementation

The email sending logic is implemented in the `afterChange` hook in `/collections/Endorsements.ts`:

```typescript
afterChange: [
  async ({ doc, operation, req }) => {
    // Only send emails on creation (new endorsement submissions)
    if (operation !== "create") return
    
    // Send to submitter (if email provided)
    // Send to admin (always)
  }
]
```

**Key design decisions:**

- Emails are sent only on `create` operations (not updates)
- Errors in email sending are logged but don't fail the endorsement creation
- Email addresses are never exposed publicly
- Admin always receives notifications for review

### Front-End View Page

A dedicated page at `/endorsements/view/[id]` allows endorsers to view their submission:

- **Status display** with color-coded cards:
  - Yellow/amber for "Pending"
  - Green for "Approved"
  - Red for "Rejected"
- **Full endorsement details** including all submitted information
- **Display preferences** showing what will be public
- **Contact information** for requesting changes
- **Professional layout** using the site's design system

**Security Note:** Currently, the page uses `overrideAccess: true` to allow viewing. In production, you should implement:
- Token-based authentication (generate unique tokens for each endorsement)
- Time-limited access links
- Or require the user to authenticate with their email

## Environment Variables Required

The following environment variables must be configured:

```bash
# Resend API Key (required)
# Sign up at https://resend.com to get your API key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Site URL for generating links in emails
NEXT_PUBLIC_SITE_URL=https://craigdavison.net

# Payload CMS URL for admin links
PAYLOAD_PUBLIC_SERVER_URL=https://craigdavison.net
```

### Setting Up Resend

1. Sign up for a free account at [resend.com](https://resend.com)
2. Verify your sending domain (e.g., `craigdavison.net`)
3. Create an API key in the dashboard
4. Add the API key to your `.env` file as `RESEND_API_KEY`

## Email Configuration in Payload

The email adapter is configured in `payload.config.ts`:

```typescript
email: resendAdapter({
  defaultFromName: "mail@craigdavison.net",
  defaultFromAddress: "mail@craigdavison.net",
  apiKey: process.env.RESEND_API_KEY || "",
})
```

## Testing

To test the email functionality:

1. **Ensure environment variables are set** (especially `RESEND_API_KEY`)
2. **Submit a test endorsement** through the public form at `/endorsements`
3. **Check your email** (both submitter and admin emails)
4. **Visit the view link** in the submitter email to test the view page
5. **Click the Payload link** in the admin email to review in CMS

### Development Testing

During development, you can test with:

- **Resend's test mode** - Some plans offer test sends
- **Your own email** - Submit endorsements with your email address
- **Console logging** - Check server logs for any errors

## Future Enhancements

Potential improvements to consider:

1. **Token-based authentication** for view pages
   - Generate secure tokens for each endorsement
   - Include token in view URL
   - Expire tokens after a certain period

2. **Edit capability** for submitters
   - Allow endorsers to update their submissions
   - Send updated version to admin for re-approval
   - Track revision history

3. **Email customization**
   - Admin can customize email templates
   - Store templates in CMS
   - A/B test different email designs

4. **Status change notifications**
   - Email submitter when status changes to approved
   - Thank them for their contribution
   - Include link to public CV site

5. **Spam prevention enhancements**
   - Rate limiting per IP address
   - Honeypot fields
   - reCAPTCHA integration

6. **Email analytics**
   - Track open rates
   - Track click-through rates on links
   - Monitor deliverability

## Troubleshooting

### Emails not sending

1. **Check API key** - Verify `RESEND_API_KEY` is set correctly
2. **Check domain verification** - Ensure sending domain is verified in Resend
3. **Check Payload logs** - Look for error messages in console
4. **Check Resend dashboard** - View send attempts and errors

### View page not working

1. **Check endorsement ID** - Ensure the ID in the URL is valid
2. **Check database** - Verify the endorsement exists
3. **Check console** - Look for fetch errors or 404s

### Styling issues in emails

1. **Test in multiple clients** - Gmail, Outlook, Apple Mail, etc.
2. **Use inline styles** - Never use external CSS in emails
3. **Use tables for layout** - Most reliable for email rendering
4. **Avoid modern CSS** - Flexbox/Grid may not work in all clients

## Related Files

- `/collections/Endorsements.ts` - Collection config with hooks
- `/emails/endorsement-submitter-notification.tsx` - Submitter email template
- `/emails/endorsement-admin-notification.tsx` - Admin email template
- `/app/(app)/endorsements/view/[id]/page.tsx` - View page for endorsements
- `/app/(app)/endorsements/page.tsx` - Public endorsement form page
- `/payload.config.ts` - Email adapter configuration

## Support

For issues or questions about the email system:

1. Check this documentation first
2. Review Resend documentation at [resend.com/docs](https://resend.com/docs)
3. Check Payload email docs at [payloadcms.com](https://payloadcms.com)
4. Review server logs for error messages
