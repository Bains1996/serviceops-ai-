# Production Agent Setup (Real Driver Use)

This document makes the Control Tower usable by real trucking operations.

## 1) Required Components
- Live site (already deployed).
- Twilio phone number for SMS.
- At least one pilot carrier with drivers and load feed.

## 2) Environment Variables
Set these on Vercel:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM_NUMBER
- TWILIO_STATUS_CALLBACK_URL (optional, recommended)
- NEXT_PUBLIC_SITE_URL
- DEMO_WEBHOOK_URL (optional for lead capture)

## 3) Twilio Inbound Webhook
In Twilio console for your number, set incoming message webhook to:
`https://serviceops-ai-site.vercel.app/api/sms/inbound`

Set status callback URL to:
`https://serviceops-ai-site.vercel.app/api/sms/status`

Security:
- Inbound and status routes now verify `X-Twilio-Signature`.
- Unsigned or invalidly signed requests are rejected with `403`.

## 4) Real Workflow
1. Driver sends SMS update (ARRIVED / LOADED / UNLOADED / DELAY / BREAKDOWN).
2. Agent updates state and timeline.
3. If driver becomes available, agent creates load recommendation + approval item.
4. Dispatcher approves in `/control-tower`.
5. Agent sends assignment SMS to driver.

## 5) Pilot-Ready Constraints
- Current state store is in-memory for demo speed.
- For full production persistence, move state to managed Postgres.
- For scale, add auth, tenancy isolation, and role permissions.

## 6) Next Hardening Steps
- Persist driver/load/approval state in database.
- Add dispatcher login and company accounts.
- Integrate TMS + GPS/ELD connectors.
- Add SMS delivery status and retry queue.
