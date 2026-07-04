# Enterprise Autonomous Setup

This is the production model for trucking carriers to connect their data, run dispatch workflows continuously, and let the system execute approved policies 24/7.

## 1) How the System Runs Without Your Laptop
- The app runs in cloud infrastructure (Vercel).
- Carrier systems push events into hosted APIs.
- Twilio sends inbound SMS webhooks directly to hosted endpoints.
- Agent logic runs server-side on every event, independent of local machines.

## 2) Integration Surface (Carrier Side)
Use `POST /api/integrations/tms` with headers:
- `x-company-id`
- `x-api-key`

Supported event types:
- `DRIVER_UPSERT` (driver master sync)
- `LOAD_UPSERT` (load board sync)
- `DRIVER_STATUS` (telematics/TMS status updates)

## 3) Driver Communication Loop
- Driver sends SMS to Twilio number.
- Twilio calls `/api/sms/inbound`.
- Agent updates status, generates recommendations, and sends outbound instructions.
- Twilio posts delivery state to `/api/sms/status`.

## 4) Autonomy Modes
Set `AUTONOMY_MODE` in environment:
- `ASSIST`: agent recommends, humans decide.
- `SUPERVISED`: low-risk recommendations auto-approved by policy.
- `AUTONOMOUS`: all compatible recommendations auto-approved.

Policy thresholds:
- `AUTONOMY_MAX_DEADHEAD_MILES`
- `AUTONOMY_MIN_RATE_PER_MILE`

AI brain recommendation layer:
- Recommended production choice: Claude via OpenRouter (`AI_BRAIN_PROVIDER=OPENROUTER`, Claude model).
- Why: high reasoning quality + easy provider/model switching without code changes.
- Safety model: deterministic policy decides execution boundaries; AI provides non-blocking next-step guidance.
- Fallback: if AI provider is unavailable, workflows continue with deterministic policy and worker retry/dead-letter controls.

## 5) Multi-Company Security
- Per-company API keys with `INTEGRATION_KEYS`.
- Twilio signature verification enabled for inbound/status webhooks.
- Reject unsigned or invalid callbacks with 403.

## 6) What Is Still Needed For Full Enterprise Grade
- Persistent database (Postgres) for state durability and historical analytics.
- Tenant isolation with RBAC auth per carrier account.
- Queue + retry workers for guaranteed delivery and long-running tasks.
- Connector packs for specific TMS/ELD vendors.
- SLO monitoring/alerting, incident runbooks, and billing/subscription management.

## 7) Onboarding Flow For A New Carrier
1. Create company API key and Twilio number.
2. Configure Twilio webhooks (`/api/sms/inbound`, `/api/sms/status`).
3. Configure TMS to push load/driver events to `/api/integrations/tms`.
4. Import current drivers and active loads via upsert events.
5. Start in `ASSIST` mode for 1-2 weeks.
6. Move to `SUPERVISED` mode when KPI and error targets are met.
7. Expand policy scope gradually.

## 8) Hosting Decision: Vercel vs Hostinger
For this architecture, the best default production host is Vercel.

Use Vercel when:
- You want fastest go-live with lowest operational overhead.
- You need reliable Next.js App Router runtime with API routes and server rendering.
- You need straightforward webhook/API hosting for Twilio and carrier integrations.

Use Hostinger only in these cases:
- You are using a Hostinger VPS (not shared hosting).
- You have an ops owner for Node runtime, process manager, reverse proxy, SSL, backups, and monitoring.
- You require infrastructure control that justifies added DevOps effort.

Not recommended:
- Hostinger shared hosting for this full-stack runtime.
- Uploading static build artifacts only for an API-heavy dispatch platform.

Recommendation for carrier rollout:
- Keep production runtime on Vercel.
- Use Hostinger for DNS/domain management if needed.
- Revisit VPS migration later once operational ownership is clear.

## 9) Hostinger Review Package (If Requested)
If Hostinger or another hosting reviewer requests technical evaluation, provide:
1. Runtime architecture and dependencies summary from this document.
2. API endpoint and integration contract from `README.md`.
3. Environment variable matrix (`.env.example`) including security and worker variables.
4. Smoke scripts proving operability (`smoke_integration.ps1`, `smoke_carrier_flow.ps1`, `go_live_check.ps1`).
5. Current production URL and test evidence that flows pass.

## 10) Hostinger VPS Migration Path (Optional, Later)
If migration is required, do this from source code (not static artifact upload):
1. Provision VPS with Node LTS, npm, nginx, PM2, and SSL.
2. Deploy source repository and run `npm.cmd run build` equivalent on server (`npm run build`).
3. Configure all production environment variables.
4. Start app with PM2 and proxy via nginx.
5. Repoint Twilio webhooks and carrier integrations to new base URL.
6. Re-run smoke tests before cutover.
7. Keep rollback route to Vercel until stability targets are met.
