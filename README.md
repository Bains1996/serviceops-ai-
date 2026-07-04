# ServiceOps AI

 Premium trucking operations site plus a functional Control Tower for 24/7 dispatch workflow.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Core Product Surfaces
- Marketing site: `/`, `/solutions`, `/modules`, `/case-studies`, `/book-demo`
- Functional operations console: `/control-tower`

## API Endpoints
- Demo lead capture: `POST /api/demo`
- Ops state: `GET /api/ops/state`, `POST /api/ops/state` (reset)
- Driver message processing: `POST /api/ops/message`
- Approval actions: `POST /api/ops/approval`
- Twilio inbound SMS: `POST /api/sms/inbound`
- Twilio SMS status callbacks: `POST /api/sms/status`
- TMS integration events: `POST /api/integrations/tms`

## Local Run (Windows)
PowerShell policy in this environment blocks `npm.ps1`/`npx.ps1`, so use `npm.cmd`.

```bash
npm.cmd install
npm.cmd run dev
```

Build check:

```bash
npm.cmd run build
```

## Required Environment Variables
Copy `.env.example` to `.env.local` and fill values.

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`
- `WORKER_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `INTEGRATION_KEYS`

Optional:

- `TWILIO_STATUS_CALLBACK_URL`
- `AUTONOMY_MODE`
- `AUTONOMY_MAX_DEADHEAD_MILES`
- `AUTONOMY_MIN_RATE_PER_MILE`
- `AI_BRAIN_ENABLED`
- `AI_BRAIN_PROVIDER`
- `AI_BRAIN_MODEL`
- `AI_BRAIN_API_KEY`
- `AI_BRAIN_BASE_URL`
- `WORKER_MAX_ATTEMPTS`
- `WORKER_RETRY_DELAY_SECONDS`
- `OPS_ALERT_WEBHOOK_URL`
- `DEMO_WEBHOOK_URL`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

## Twilio Setup
Set incoming message webhook for your Twilio number to:

- `https://<your-domain>/api/sms/inbound`

Optional delivery status callback:

- `https://<your-domain>/api/sms/status`

## TMS Integration Contract
Authenticated by headers:

- `x-company-id`
- `x-api-key`

For persistent tenant-backed ops state, configure `DATABASE_URL` so each carrier gets durable dispatch state and connection records.

Supported events:

- `DRIVER_UPSERT`
- `LOAD_UPSERT`
- `DRIVER_STATUS`

Autonomy modes:

- `ASSIST`: always route recommendations to dispatcher approval.
- `SUPERVISED`: auto-approve only low-risk recommendations by policy thresholds.
- `AUTONOMOUS`: auto-approve compatible recommendations.

## Deployment
Production deploy (used in this workspace):

```bash
npm.cmd exec --yes vercel@latest -- --prod --yes --cwd c:\vouch_app\serviceops-ai-site
```

Current production alias:

- `https://serviceops-ai-site.vercel.app`

## Background Processing
- A durable job queue backs continuous backend automation.
- Worker endpoint: `POST /api/internal/process-jobs`
- Protect it with `WORKER_SECRET` sent as `x-worker-secret`.
- Worker retries transient failures automatically and moves exhausted jobs to `DEAD_LETTER` with alert webhook notifications.
- Optional AI brain guidance can run during worker automation (non-blocking): deterministic policy remains source of truth, AI adds operational recommendations.
- `vercel.json` includes a cron entry to invoke this endpoint daily at 03:00 UTC (Hobby-plan compatible).
- For near-real-time processing, either upgrade Vercel plan for higher-frequency cron support or trigger `/api/internal/process-jobs` from an external scheduler every minute.
- One-shot manual worker trigger script: `powershell -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\worker_tick.ps1 -WorkerSecret <secret>`

## Smoke Tests
- Basic integration smoke: `powershell -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\smoke_integration.ps1`
- Full carrier flow smoke (creates operator session and validates protected ops APIs): `powershell -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\smoke_carrier_flow.ps1`
- To test worker processing too: `powershell -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\smoke_carrier_flow.ps1 -WorkerSecret <secret>`
- One-command go-live check: `powershell -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\go_live_check.ps1`

## AI Brain (Claude/OpenAI/OpenRouter)
- Recommended default: `AI_BRAIN_PROVIDER=OPENROUTER` with Claude model for quality and provider flexibility.
- Alternative providers supported directly: `OPENAI`, `ANTHROPIC`.
- This AI layer is intentionally non-blocking: if provider/API fails, operations continue via rule-based autonomy and queue retries.

## If GitHub Credits Expire
You can keep shipping without paid GitHub AI credits:

1. Keep runtime online: this app runs on Next.js + Vercel + Postgres + Twilio and is independent from Copilot credits.
2. Use local coding AI for development assistance:
	- `powershell -ExecutionPolicy Bypass -File c:\vouch_app\scripts\start-local-ai.ps1`
	- `powershell -ExecutionPolicy Bypass -File c:\vouch_app\scripts\quick-agent-test.ps1`
3. Continue with deterministic release checks using scripts in this repo:
	- Build: `npm.cmd --prefix c:\vouch_app\serviceops-ai-site run build`
	- Integration smoke: `smoke_integration.ps1`
	- Full flow smoke: `smoke_carrier_flow.ps1`
4. If you still want cloud AI after credits, switch to API-based coding assistance (OpenRouter/OpenAI/Anthropic) through your local tooling in `scripts/` and `remote-studio/`.
