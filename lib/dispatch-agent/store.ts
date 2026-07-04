import { randomUUID } from "crypto";

import { DispatchState } from "./types";

const now = () => new Date().toISOString();

export function createSeedState(): DispatchState {
  return {
    updatedAt: now(),
    drivers: [
      {
        id: "drv-1",
        name: "Raj Singh",
        phone: "+1-604-555-1001",
        equipment: "DRY_VAN",
        status: "EN_ROUTE",
        city: "Abbotsford, BC",
        lat: 49.0504,
        lng: -122.3045,
        currentLoadId: "ld-101",
        lastUpdateAt: now(),
      },
      {
        id: "drv-2",
        name: "Gurpreet Gill",
        phone: "+1-604-555-1002",
        equipment: "REEFER",
        status: "AVAILABLE",
        city: "Calgary, AB",
        lat: 51.0447,
        lng: -114.0719,
        lastUpdateAt: now(),
      },
    ],
    loads: [
      {
        id: "ld-101",
        customer: "Pacific Grocers",
        origin: "Vancouver, BC",
        destination: "Kelowna, BC",
        pickupAt: "2026-06-26T09:00:00.000Z",
        deliveryAt: "2026-06-26T14:00:00.000Z",
        equipment: "DRY_VAN",
        rateCad: 1480,
        loadedMiles: 245,
        deadheadMiles: 20,
        status: "IN_PROGRESS",
        assignedDriverId: "drv-1",
      },
      {
        id: "ld-201",
        customer: "Prairie Retail",
        origin: "Kamloops, BC",
        destination: "Surrey, BC",
        pickupAt: "2026-06-26T18:00:00.000Z",
        deliveryAt: "2026-06-27T02:00:00.000Z",
        equipment: "DRY_VAN",
        rateCad: 2100,
        loadedMiles: 220,
        deadheadMiles: 18,
        status: "OPEN",
      },
      {
        id: "ld-202",
        customer: "FreshWest Foods",
        origin: "Calgary, AB",
        destination: "Edmonton, AB",
        pickupAt: "2026-06-26T17:30:00.000Z",
        deliveryAt: "2026-06-26T22:00:00.000Z",
        equipment: "REEFER",
        rateCad: 1250,
        loadedMiles: 190,
        deadheadMiles: 12,
        status: "OPEN",
      },
    ],
    approvals: [],
    timeline: [
      {
        id: randomUUID(),
        at: now(),
        actor: "System",
        title: "Control tower initialized",
        detail: "Dispatch agent started for 24/7 operations.",
      },
    ],
    outbound: [],
  };
}

type GlobalStore = typeof globalThis & {
  __dispatchState?: DispatchState;
};

const globalStore = globalThis as GlobalStore;

export function getState(): DispatchState {
  if (!globalStore.__dispatchState) {
    globalStore.__dispatchState = createSeedState();
  }
  return globalStore.__dispatchState;
}

export function updateState(mutator: (state: DispatchState) => void): DispatchState {
  const state = getState();
  mutator(state);
  state.updatedAt = now();
  return state;
}

export function resetState(): DispatchState {
  globalStore.__dispatchState = createSeedState();
  return globalStore.__dispatchState;
}

export function addTimelineEvent(actor: string, title: string, detail: string): DispatchState {
  return updateState((state) => {
    state.timeline.unshift({
      id: randomUUID(),
      at: now(),
      actor,
      title,
      detail,
    });
  });
}
