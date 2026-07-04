type AlertLevel = "INFO" | "WARN" | "ERROR";

type OpsAlert = {
  level: AlertLevel;
  title: string;
  message: string;
  companyId?: string;
  metadata?: Record<string, unknown>;
};

function getAlertWebhookUrl() {
  return process.env.OPS_ALERT_WEBHOOK_URL?.trim() ?? "";
}

export async function sendOpsAlert(alert: OpsAlert) {
  const payload = {
    ...alert,
    at: new Date().toISOString(),
    service: "serviceops-ai-site",
  };

  const webhookUrl = getAlertWebhookUrl();
  if (!webhookUrl) {
    const printer = alert.level === "ERROR" ? console.error : console.warn;
    printer(`[OPS ${alert.level}] ${alert.title}: ${alert.message}`);
    return;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`[OPS ALERT ERROR] webhook returned ${res.status}`);
    }
  } catch (error) {
    console.error("[OPS ALERT ERROR] unable to send alert", error);
  }
}