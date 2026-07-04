import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { DispatchState, Driver, DriverStatus, EquipmentType, LoadStatus } from "@/lib/dispatch-agent/types";
import { runAutonomyCycleOnState } from "@/lib/platform/autonomy-runner";
import { authenticateIntegration } from "@/lib/platform/integration-auth";
import { touchConnectionRecord } from "@/lib/platform/connections-store";
import { markDispatchEventFailed, markDispatchEventProcessed, recordDispatchEvent } from "@/lib/platform/event-store";
import { enqueueDispatchJob } from "@/lib/platform/job-store";
import { updateCompanyState } from "@/lib/platform/tenant-state-store";

const now = () => new Date().toISOString();

type IntegrationEventType = "DRIVER_UPSERT" | "LOAD_UPSERT" | "DRIVER_STATUS";

type DriverUpsertPayload = {
  id: string;
  name: string;
  phone: string;
  equipment: EquipmentType;
  city: string;
  status?: DriverStatus;
};

type LoadUpsertPayload = {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  pickupAt: string;
  deliveryAt: string;
  equipment: EquipmentType;
  rateCad: number;
  loadedMiles: number;
  deadheadMiles: number;
  status?: LoadStatus;
  assignedDriverId?: string;
};

type DriverStatusPayload = {
  driverId: string;
  status: DriverStatus;
  city?: string;
  lat?: number;
  lng?: number;
  note?: string;
};

type IntegrationPayload = {
  eventType: IntegrationEventType;
  payload: DriverUpsertPayload | LoadUpsertPayload | DriverStatusPayload;
};

function isEquipmentType(value: string): value is EquipmentType {
  return value === "DRY_VAN" || value === "REEFER";
}

function isDriverStatus(value: string): value is DriverStatus {
  return ["OFF_DUTY", "AVAILABLE", "EN_ROUTE", "AT_PICKUP", "AT_DROPOFF", "DELAYED", "BREAKDOWN"].includes(value);
}

function isLoadStatus(value: string): value is LoadStatus {
  return ["OPEN", "ASSIGNED", "IN_PROGRESS", "DELIVERED"].includes(value);
}

function upsertDriver(state: DispatchState, input: DriverUpsertPayload) {
    const existing = state.drivers.find((driver) => driver.id === input.id || driver.phone === input.phone);
    if (existing) {
      existing.name = input.name;
      existing.phone = input.phone;
      existing.city = input.city;
      existing.equipment = input.equipment;
      if (input.status) existing.status = input.status;
      existing.lastUpdateAt = now();
    } else {
      const driver: Driver = {
        id: input.id,
        name: input.name,
        phone: input.phone,
        city: input.city,
        equipment: input.equipment,
        status: input.status ?? "AVAILABLE",
        lastUpdateAt: now(),
      };
      state.drivers.unshift(driver);
    }

    state.timeline.unshift({
      id: randomUUID(),
      at: now(),
      actor: "TMS Integration",
      title: "Driver upserted",
      detail: `Driver ${input.name} synchronized from TMS.`,
    });
}

function upsertLoad(state: DispatchState, input: LoadUpsertPayload) {
    const existing = state.loads.find((load) => load.id === input.id);
    if (existing) {
      existing.customer = input.customer;
      existing.origin = input.origin;
      existing.destination = input.destination;
      existing.pickupAt = input.pickupAt;
      existing.deliveryAt = input.deliveryAt;
      existing.equipment = input.equipment;
      existing.rateCad = input.rateCad;
      existing.loadedMiles = input.loadedMiles;
      existing.deadheadMiles = input.deadheadMiles;
      if (input.status) existing.status = input.status;
      existing.assignedDriverId = input.assignedDriverId;
    } else {
      state.loads.unshift({
        id: input.id,
        customer: input.customer,
        origin: input.origin,
        destination: input.destination,
        pickupAt: input.pickupAt,
        deliveryAt: input.deliveryAt,
        equipment: input.equipment,
        rateCad: input.rateCad,
        loadedMiles: input.loadedMiles,
        deadheadMiles: input.deadheadMiles,
        status: input.status ?? "OPEN",
        assignedDriverId: input.assignedDriverId,
      });
    }

    state.timeline.unshift({
      id: randomUUID(),
      at: now(),
      actor: "TMS Integration",
      title: "Load upserted",
      detail: `Load ${input.id} synchronized from TMS.`,
    });
}

function applyDriverStatus(state: DispatchState, input: DriverStatusPayload) {
    const driver = state.drivers.find((item) => item.id === input.driverId);
    if (!driver) return;

    driver.status = input.status;
    if (input.city) driver.city = input.city;
    if (typeof input.lat === "number") driver.lat = input.lat;
    if (typeof input.lng === "number") driver.lng = input.lng;
    driver.lastUpdateAt = now();

    state.timeline.unshift({
      id: randomUUID(),
      at: now(),
      actor: "TMS Integration",
      title: "Driver status updated",
      detail: `${driver.name} is now ${input.status}.${input.note ? ` ${input.note}` : ""}${typeof input.lat === "number" && typeof input.lng === "number" ? ` GPS ${input.lat.toFixed(4)}, ${input.lng.toFixed(4)}.` : ""}`,
    });
}

export async function POST(request: Request) {
  let eventId: string | undefined;
  try {
    const auth = await authenticateIntegration(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: "Unauthorized integration request." }, { status: 401 });
    }

    const body = (await request.json()) as IntegrationPayload;
    if (!body?.eventType || !body?.payload) {
      return NextResponse.json({ ok: false, message: "eventType and payload are required." }, { status: 400 });
    }

    const event = await recordDispatchEvent({
      companyId: auth.companyId,
      source: "TMS",
      eventType: body.eventType,
      summary: `Inbound ${body.eventType} event received from carrier integration.`,
      payload: body,
    });
    eventId = event.id;

    const state = await updateCompanyState(auth.companyId, (state) => {
      if (body.eventType === "DRIVER_UPSERT") {
        const payload = body.payload as Partial<DriverUpsertPayload>;
        if (!payload.id || !payload.name || !payload.phone || !payload.city || !payload.equipment || !isEquipmentType(payload.equipment)) {
          throw new Error("Invalid DRIVER_UPSERT payload.");
        }
        if (payload.status && !isDriverStatus(payload.status)) {
          throw new Error("Invalid DRIVER_UPSERT status.");
        }
        upsertDriver(state, payload as DriverUpsertPayload);
      } else if (body.eventType === "LOAD_UPSERT") {
        const payload = body.payload as Partial<LoadUpsertPayload>;
        if (!payload.id || !payload.customer || !payload.origin || !payload.destination || !payload.pickupAt || !payload.deliveryAt || !payload.equipment || !isEquipmentType(payload.equipment)) {
          throw new Error("Invalid LOAD_UPSERT payload.");
        }
        if (typeof payload.rateCad !== "number" || typeof payload.loadedMiles !== "number" || typeof payload.deadheadMiles !== "number") {
          throw new Error("Invalid LOAD_UPSERT numeric fields.");
        }
        if (payload.status && !isLoadStatus(payload.status)) {
          throw new Error("Invalid LOAD_UPSERT status.");
        }
        upsertLoad(state, payload as LoadUpsertPayload);
      } else if (body.eventType === "DRIVER_STATUS") {
        const payload = body.payload as Partial<DriverStatusPayload>;
        if (!payload.driverId || !payload.status || !isDriverStatus(payload.status)) {
          throw new Error("Invalid DRIVER_STATUS payload.");
        }
        if ((payload.lat !== undefined && typeof payload.lat !== "number") || (payload.lng !== undefined && typeof payload.lng !== "number")) {
          throw new Error("Invalid DRIVER_STATUS coordinates.");
        }
        applyDriverStatus(state, payload as DriverStatusPayload);
      } else {
        throw new Error("Unsupported eventType.");
      }

      return runAutonomyCycleOnState(state);
    });

    await touchConnectionRecord(auth.companyId);
    await enqueueDispatchJob({
      companyId: auth.companyId,
      jobType: "POST_EVENT_AUTOMATION",
      payload: { eventId, eventType: body.eventType },
    });
    if (eventId) await markDispatchEventProcessed(eventId);
    return NextResponse.json({ ok: true, companyId: auth.companyId, state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process integration event.";
    if (eventId) await markDispatchEventFailed(eventId, message);
    if (message.startsWith("Invalid ") || message === "Unsupported eventType.") {
      return NextResponse.json({ ok: false, message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Unable to process integration event." }, { status: 500 });
  }
}
