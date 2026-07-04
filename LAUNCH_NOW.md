# Launch Now (Non-Technical)

Use this exact checklist to go live and run ads.

## 1) Deploy
- Deploy folder `serviceops-ai-site` to Vercel.
- Set production domain (for example: `serviceops.ai`).

## 2) Set Environment Variables
In Vercel project settings, add:

- `DEMO_WEBHOOK_URL` = your webhook/CRM endpoint
- `NEXT_PUBLIC_SITE_URL` = your live website URL (example: `https://serviceops.ai`)
- `NEXT_PUBLIC_GA_ID` = your Google Analytics ID (optional)
- `NEXT_PUBLIC_META_PIXEL_ID` = your Meta Pixel ID (optional)

## 3) Verify Lead Capture
- Open `/book-demo` on your live site.
- Submit a test form.
- Confirm it redirects to `/thank-you`.
- Confirm your webhook/CRM receives the lead payload.

## 4) Verify Ads Tracking (if configured)
- Open browser dev tools network tab.
- Submit test lead.
- Confirm Google/Meta events fire on submit and on thank-you page.

## 5) Start Ads
- Send paid traffic to `/book-demo` first.
- Keep `/thank-you` as conversion success destination.

## 6) Daily Operating Rule
- Check leads twice daily.
- Contact each lead within 30 minutes during business hours.

Done. Website is launch-ready after this checklist.
