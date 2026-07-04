import { addCompanyTimelineEvent } from "./tenant-state-store";
import { sendOpsAlert } from "./alerts";
import { generateAIBrainGuidance } from "./ai-brain";
import {
  claimPendingJobs,
  completeDispatchJob,
  deadLetterDispatchJob,
  requeueDispatchJob,
} from "./job-store";
import { getCompanyState } from "./tenant-state-store";

function parsePositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function processPendingDispatchJobs(limit = 20) {
  const jobs = await claimPendingJobs(limit);
  let processed = 0;
  let failed = 0;
  let retried = 0;
  let deadLettered = 0;
  const maxAttempts = parsePositiveNumber(process.env.WORKER_MAX_ATTEMPTS, 3);
  const retryDelaySeconds = parsePositiveNumber(process.env.WORKER_RETRY_DELAY_SECONDS, 90);

  for (const job of jobs) {
    try {
      if (job.jobType === "POST_EVENT_AUTOMATION") {
        const payload = (job.payload ?? {}) as { eventType?: string; eventId?: string };

        await addCompanyTimelineEvent(
          job.companyId,
          "Worker",
          "Background automation reviewed",
          `Processed queued automation follow-up for event-driven workflow.`,
        );

        try {
          const state = await getCompanyState(job.companyId);
          const guidance = await generateAIBrainGuidance({
            companyId: job.companyId,
            eventType: payload.eventType,
            eventId: payload.eventId,
            state,
          });

          if (guidance) {
            await addCompanyTimelineEvent(
              job.companyId,
              "AI Brain",
              "Autonomous ops recommendation",
              `${guidance.summary} Next: ${guidance.actions.join(" | ")}`,
            );
          }
        } catch (brainError) {
          await sendOpsAlert({
            level: "WARN",
            title: "AI brain guidance failed",
            message: brainError instanceof Error ? brainError.message : "Unknown AI brain failure.",
            companyId: job.companyId,
            metadata: { jobId: job.id, jobType: job.jobType },
          });
        }
      }

      if (job.jobType === "SYNC_CONNECTION_ACTIVITY") {
        await addCompanyTimelineEvent(
          job.companyId,
          "Worker",
          "Connection activity sync",
          `Processed queued connection activity synchronization task.`,
        );
      }

      await completeDispatchJob(job.id);
      processed += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown worker failure.";
      failed += 1;

      if (job.attempts >= maxAttempts) {
        deadLettered += 1;
        await deadLetterDispatchJob(job.id, reason);
        await addCompanyTimelineEvent(
          job.companyId,
          "Worker",
          "Job moved to dead letter",
          `Job ${job.jobType} failed after ${job.attempts} attempts.`,
        );
        await sendOpsAlert({
          level: "ERROR",
          title: "Dispatch job dead-lettered",
          message: `Job ${job.id} (${job.jobType}) moved to dead-letter after ${job.attempts} attempts.`,
          companyId: job.companyId,
          metadata: { jobId: job.id, attempts: job.attempts, reason },
        });
      } else {
        retried += 1;
        await requeueDispatchJob(job.id, reason, retryDelaySeconds);
        await addCompanyTimelineEvent(
          job.companyId,
          "Worker",
          "Job retry scheduled",
          `Retrying ${job.jobType} after failure (attempt ${job.attempts}/${maxAttempts}).`,
        );
      }
    }
  }

  return { processed, failed, retried, deadLettered, claimed: jobs.length };
}
