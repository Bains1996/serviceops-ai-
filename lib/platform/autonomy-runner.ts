import { applyApprovalOnState } from "@/lib/dispatch-agent/engine";
import { getState } from "@/lib/dispatch-agent/store";
import { DispatchState } from "@/lib/dispatch-agent/types";
import { decideApprovalAction } from "@/lib/platform/autonomy-policy";

export function runAutonomyCycle() {
  let state = getState();
  return runAutonomyCycleOnState(state);
}

export function runAutonomyCycleOnState(initialState: DispatchState) {
  let state = initialState;
  const pendingIds = state.approvals.filter((item) => item.status === "PENDING").map((item) => item.id);

  for (const approvalId of pendingIds) {
    const action = decideApprovalAction(state, approvalId);
    if (action === "APPROVE") {
      state = applyApprovalOnState(state, approvalId, "APPROVE");
    }
  }

  return state;
}
