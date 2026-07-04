import { redirect } from "next/navigation";

import { getCarrierSession } from "@/lib/platform/operator-auth";

import { ControlTowerConsole } from "../components/control-tower-console";
import { SitePage } from "../components/site-page";

export default async function ControlTowerPage() {
  const session = await getCarrierSession();
  if (!session) {
    redirect("/portal");
  }

  return (
    <SitePage
      eyebrow="Working Product"
      title="24/7 Dispatch Agent Control Tower"
      description="This is a functional agent workflow: process driver messages, auto-update load state, generate next-load recommendations, and approve dispatch actions in real time."
    >
      <ControlTowerConsole />
    </SitePage>
  );
}
