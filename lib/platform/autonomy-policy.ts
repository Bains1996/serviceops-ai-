import { DispatchState, DriverStatus, EquipmentType } from "@/lib/dispatch-agent/types";

type AutonomyMode = "ASSIST" | "SUPERVISED" | "AUTONOMOUS";

type AutonomyDecision = "APPROVE" | "REVIEW";

function getMode(): AutonomyMode {
  const mode = (process.env.AUTONOMY_MODE ?? "SUPERVISED").toUpperCase();
  if (mode === "ASSIST" || mode === "SUPERVISED" || mode === "AUTONOMOUS") return mode;
  return "SUPERVISED";
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isDispatchableStatus(status: DriverStatus) {
  return status === "AVAILABLE" || status === "AT_DROPOFF";
}

function equipmentCompatible(required: EquipmentType, actual: EquipmentType) {
  return required === actual;
}

export function decideApprovalAction(state: DispatchState, approvalId: string): AutonomyDecision {
  const mode = getMode();
  if (mode === "ASSIST") return "REVIEW";

  const approval = state.approvals.find((item) => item.id === approvalId);
  if (!approval || approval.status !== "PENDING") return "REVIEW";

  const driver = state.drivers.find((item) => item.id === approval.driverId);
  const load = state.loads.find((item) => item.id === approval.loadId);

  if (!driver || !load) return "REVIEW";

  if (mode === "AUTONOMOUS") {
    return equipmentCompatible(load.equipment, driver.equipment) ? "APPROVE" : "REVIEW";
  }

  const maxDeadhead = parseNumber(process.env.AUTONOMY_MAX_DEADHEAD_MILES, 20);
  const minRatePerMile = parseNumber(process.env.AUTONOMY_MIN_RATE_PER_MILE, 4.5);
  const ratePerMile = load.rateCad / Math.max(1, load.loadedMiles);

  if (!isDispatchableStatus(driver.status)) return "REVIEW";
  if (!equipmentCompatible(load.equipment, driver.equipment)) return "REVIEW";
  if (load.deadheadMiles > maxDeadhead) return "REVIEW";
  if (ratePerMile < minRatePerMile) return "REVIEW";

  return "APPROVE";
}
