import { randomUUID } from "crypto";

import { updateState } from "./store";
import { ApprovalDecision, DispatchState, Driver, DriverMessageInput, Load } from "./types";

const now = () => new Date().toISOString();

function addTimeline(state: DispatchState, actor: string, title: string, detail: string) {
  state.timeline.unshift({
    id: randomUUID(),
    at: now(),
    actor,
    title,
    detail,
  });
}

function addOutbound(state: DispatchState, to: string, body: string) {
  state.outbound.unshift({
    id: randomUUID(),
    at: now(),
    to,
    body,
  });
}

function findBestLoad(driver: Driver, loads: Load[]) {
  const openLoads = loads.filter((load) => load.status === "OPEN" && load.equipment === driver.equipment);
  const scored = openLoads
    .map((load) => {
      const ratePerMile = load.rateCad / Math.max(1, load.loadedMiles);
      const score = ratePerMile * 100 - load.deadheadMiles * 2;
      return { load, score, ratePerMile };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.load;
}

function findBestLoadWithScore(driver: Driver, loads: Load[]) {
  const openLoads = loads.filter((load) => load.status === "OPEN" && load.equipment === driver.equipment);
  const scored = openLoads
    .map((load) => {
      const ratePerMile = load.rateCad / Math.max(1, load.loadedMiles);
      const score = ratePerMile * 100 - load.deadheadMiles * 2;
      return { load, score, ratePerMile };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0];
}

function recommendNextLoad(state: DispatchState, driver: Driver) {
  const match = findBestLoadWithScore(driver, state.loads);
  if (!match) {
    addOutbound(
      state,
      driver.phone,
      "No approved load yet. Stand by at current location; dispatch will update you shortly.",
    );
    addTimeline(state, "Agent", "No load available", `No matching open load found for ${driver.name}.`);
    return;
  }

  const { load: candidate, score, ratePerMile } = match;

  const recommendedMessage = `Next recommended load ${candidate.id}: pickup ${candidate.origin} at ${new Date(candidate.pickupAt).toLocaleTimeString()} for ${candidate.destination}. Reply CONFIRM once assigned.`;

  state.approvals.unshift({
    id: randomUUID(),
    at: now(),
    status: "PENDING",
    workflow: "NEXT_LOAD_ASSIGNMENT",
    reason: `Driver ${driver.name} is available. Best load by margin/deadhead score is ${candidate.id}.`,
    driverId: driver.id,
    loadId: candidate.id,
    score,
    deadheadMiles: candidate.deadheadMiles,
    ratePerMile,
    recommendedMessage,
  });

  addTimeline(
    state,
    "Agent",
    "Approval required",
    `Recommended ${candidate.id} for ${driver.name} at ${ratePerMile.toFixed(2)} CAD/mi and ${candidate.deadheadMiles} mi deadhead.`,
  );
}

function handleDriverMessage(state: DispatchState, driver: Driver, originalText: string) {
  const text = originalText.trim().toLowerCase();
  driver.lastUpdateAt = now();

  addTimeline(state, driver.name, "Driver message", originalText);

  if (text.includes("breakdown") || text.includes("broke down")) {
    driver.status = "BREAKDOWN";
    addOutbound(
      state,
      driver.phone,
      "Copy. Breakdown workflow started. Send exact location + issue type. Repair coordination is being arranged.",
    );
    addTimeline(state, "Agent", "Breakdown triage", `Breakdown flow started for ${driver.name}.`);
    return;
  }

  if (text.includes("delay") || text.includes("late")) {
    driver.status = "DELAYED";
    addOutbound(
      state,
      driver.phone,
      "Received. Delay recorded. Please share updated ETA. Dispatch is notifying customer if needed.",
    );
    addTimeline(state, "Agent", "Delay flagged", `${driver.name} reported delay.`);
    return;
  }

  const isUnloaded = /\bunloaded\b|\bempty\b|^free$/.test(text);
  const isLoaded = /\bloaded\b/.test(text) && !isUnloaded;

  if (text.includes("arrived")) {
    driver.status = "AT_PICKUP";
    addOutbound(state, driver.phone, "Arrival logged. Update with LOADED when loading is complete.");
    return;
  }

  if (isLoaded) {
    driver.status = "EN_ROUTE";
    addOutbound(state, driver.phone, "Loaded status recorded. Proceed to destination and text UNLOADED when complete.");
    if (driver.currentLoadId) {
      const load = state.loads.find((item) => item.id === driver.currentLoadId);
      if (load) load.status = "IN_PROGRESS";
    }
    return;
  }

  if (isUnloaded) {
    driver.status = "AVAILABLE";
    if (driver.currentLoadId) {
      const current = state.loads.find((item) => item.id === driver.currentLoadId);
      if (current) current.status = "DELIVERED";
      driver.currentLoadId = undefined;
    }
    recommendNextLoad(state, driver);
    addOutbound(state, driver.phone, "Unloaded status recorded. Finding your best next load now.");
    return;
  }

  addOutbound(
    state,
    driver.phone,
    "Received. If this is a status update, send one of: ARRIVED, LOADED, UNLOADED, DELAY, BREAKDOWN.",
  );
}

export function processDriverMessage(input: DriverMessageInput) {
  return updateState((state) => {
    const driver = state.drivers.find((item) => item.id === input.driverId);
    if (!driver) return;

    handleDriverMessage(state, driver, input.text);
  });
}

export function processDriverMessageOnState(state: DispatchState, input: DriverMessageInput) {
  const driver = state.drivers.find((item) => item.id === input.driverId);
  if (!driver) return state;

  handleDriverMessage(state, driver, input.text);
  return state;
}

export function processDriverMessageByPhone(phone: string, text: string) {
  return updateState((state) => {
    const normalizedIncoming = phone.replace(/[^0-9+]/g, "");
    const driver = state.drivers.find((item) => item.phone.replace(/[^0-9+]/g, "") === normalizedIncoming);

    if (!driver) {
      addTimeline(
        state,
        "Agent",
        "Unknown phone",
        `Incoming SMS from ${phone} does not match a configured driver.`,
      );
      return;
    }

    handleDriverMessage(state, driver, text);
  });
}

export function processDriverMessageByPhoneOnState(state: DispatchState, phone: string, text: string) {
  const normalizedIncoming = phone.replace(/[^0-9+]/g, "");
  const driver = state.drivers.find((item) => item.phone.replace(/[^0-9+]/g, "") === normalizedIncoming);

  if (!driver) {
    addTimeline(
      state,
      "Agent",
      "Unknown phone",
      `Incoming SMS from ${phone} does not match a configured driver.`,
    );
    return state;
  }

  handleDriverMessage(state, driver, text);
  return state;
}

export function applyApproval(approvalId: string, decision: ApprovalDecision) {
  return updateState((state) => {
    const approval = state.approvals.find((item) => item.id === approvalId);
    if (!approval || approval.status !== "PENDING") return;

    const driver = state.drivers.find((item) => item.id === approval.driverId);
    const load = state.loads.find((item) => item.id === approval.loadId);

    approval.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";

    if (!driver || !load) return;

    if (decision === "APPROVE") {
      load.status = "ASSIGNED";
      load.assignedDriverId = driver.id;
      driver.currentLoadId = load.id;
      driver.status = "EN_ROUTE";

      addOutbound(state, driver.phone, approval.recommendedMessage);
      addTimeline(state, "Dispatcher", "Load approved", `Assigned ${load.id} to ${driver.name}.`);
      return;
    }

    addTimeline(state, "Dispatcher", "Load recommendation rejected", `Rejected ${load.id} for ${driver.name}.`);
    addOutbound(state, driver.phone, "Current recommendation was not approved. Stand by for next assignment.");
  });
}

export function applyApprovalOnState(state: DispatchState, approvalId: string, decision: ApprovalDecision) {
  const approval = state.approvals.find((item) => item.id === approvalId);
  if (!approval || approval.status !== "PENDING") return state;

  const driver = state.drivers.find((item) => item.id === approval.driverId);
  const load = state.loads.find((item) => item.id === approval.loadId);

  approval.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";

  if (!driver || !load) return state;

  if (decision === "APPROVE") {
    load.status = "ASSIGNED";
    load.assignedDriverId = driver.id;
    driver.currentLoadId = load.id;
    driver.status = "EN_ROUTE";

    addOutbound(state, driver.phone, approval.recommendedMessage);
    addTimeline(state, "Dispatcher", "Load approved", `Assigned ${load.id} to ${driver.name}.`);
    return state;
  }

  addTimeline(state, "Dispatcher", "Load recommendation rejected", `Rejected ${load.id} for ${driver.name}.`);
  addOutbound(state, driver.phone, "Current recommendation was not approved. Stand by for next assignment.");
  return state;
}
