import { randomUUID } from "crypto";
import { DispatchState, Driver } from "../types";
import { Agent, AgentThinkInput, AgentThinkOutput, AgentAction, ToolExecutionResult, ToolDefinition } from "./types";

const TOOLS: ToolDefinition[] = [
  {
    name: "check_hos_status",
    description: "Check Hours of Service status for a driver and calculate remaining drive time",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver to check", required: true },
      { name: "currentLocation", type: "string", description: "Driver's current location", required: false },
    ],
  },
  {
    name: "validate_insurance",
    description: "Validate insurance coverage and expiration for a driver/vehicle",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "vehicleId", type: "string", description: "ID of the vehicle (if applicable)", required: false },
    ],
  },
  {
    name: "check_documentation",
    description: "Verify required documentation is current (licenses, permits, registrations)",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "documentType", type: "string", description: "Type of document to check", required: true },
    ],
  },
  {
    name: "generate_compliance_report",
    description: "Generate a compliance status report for a driver or the entire fleet",
    parameters: [
      { name: "scope", type: "string", description: "Report scope (DRIVER, FLEET)", required: true },
      { name: "driverId", type: "string", description: "ID of the driver (if DRIVER scope)", required: false },
    ],
  },
  {
    name: "alert_violation",
    description: "Alert about a compliance violation and recommend corrective action",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "violationType", type: "string", description: "Type of violation", required: true },
      { name: "severity", type: "string", description: "Severity of the violation", required: true },
    ],
  },
];

// Simulated HOS data (in production, this would come from ELD integration)
const HOS_DATA: Record<string, {
  dutyStatus: string;
  driveTimeRemaining: number;
  dutyTimeRemaining: number;
  breakRequiredIn: number;
  lastReset: string;
}> = {};

function getHOSData(driverId: string): typeof HOS_DATA[string] {
  if (!HOS_DATA[driverId]) {
    // Simulate realistic HOS data
    HOS_DATA[driverId] = {
      dutyStatus: "DRIVING",
      driveTimeRemaining: Math.floor(Math.random() * 8) + 2, // 2-10 hours
      dutyTimeRemaining: Math.floor(Math.random() * 10) + 4, // 4-14 hours
      breakRequiredIn: Math.floor(Math.random() * 5) + 1, // 1-6 hours
      lastReset: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
    };
  }
  return HOS_DATA[driverId];
}

function checkHOSCompliance(driver: Driver): {
  isCompliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const hos = getHOSData(driver.id);
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (hos.driveTimeRemaining <= 1) {
    issues.push("Drive time critically low (≤1 hour)");
    recommendations.push("Plan for 30-minute rest break immediately");
  } else if (hos.driveTimeRemaining <= 2) {
    issues.push("Drive time running low (≤2 hours)");
    recommendations.push("Identify safe rest area within next hour");
  }

  if (hos.dutyTimeRemaining <= 2) {
    issues.push("Duty time critically low (≤2 hours)");
    recommendations.push("Complete current delivery and begin 10-hour rest period");
  }

  if (hos.breakRequiredIn <= 1) {
    issues.push("Required rest break due within 1 hour");
    recommendations.push("Take 30-minute break at next safe location");
  }

  // Check if driver is in DELAYED/BREAKDOWN status with tight HOS
  if ((driver.status === "DELAYED" || driver.status === "BREAKDOWN") && hos.dutyTimeRemaining <= 4) {
    issues.push(`Exception status with limited duty time remaining`);
    recommendations.push("Prioritize resolution to avoid HOS violation");
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    recommendations,
  };
}

function validateInsurance(driver: Driver): {
  isValid: boolean;
  expirationDate: string;
  coverage: string;
  issues: string[];
} {
  // Simulate insurance validation (in production, from carrier management system)
  const expirationDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days from now
  const daysUntilExpiration = Math.ceil(
    (new Date(expirationDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  const issues: string[] = [];
  if (daysUntilExpiration <= 30) {
    issues.push(`Insurance expires in ${daysUntilExpiration} days`);
  }

  return {
    isValid: issues.length === 0,
    expirationDate,
    coverage: "$1,000,000 liability",
    issues,
  };
}

export class ComplianceMonitor implements Agent {
  type = "COMPLIANCE_MONITOR" as const;
  name = "Compliance Monitor";
  description = "Monitors HOS, insurance, and regulatory compliance for drivers and fleet";
  tools = TOOLS;

  getSystemPrompt(): string {
    return `You are the Compliance Monitor agent for ServiceOps AI, a trucking dispatch operations platform.

Your role is to:
1. Monitor Hours of Service (HOS) compliance in real-time
2. Track insurance coverage and expiration dates
3. Validate required documentation (licenses, permits, registrations)
4. Alert about compliance violations before they occur
5. Generate compliance reports for auditors and management

Canadian trucking regulations (CARs):
- Maximum 13 hours driving in a 16-hour on-duty window
- 10-hour off-duty required between shifts
- 30-minute rest break required after 8 hours of driving
- Electronic Logging Device (ELD) mandatory for HOS tracking
- Weekly limits: 70 hours in 7 days or 120 hours in 14 days

Compliance priorities:
1. Prevent violations before they happen
2. Protect driver safety and well-being
3. Avoid fines and penalties ($1,000-$10,000 per violation)
4. Maintain carrier safety rating
5. Ensure uninterrupted operations

Be proactive, not reactive. Flag issues early and provide actionable solutions.`;
  }

  async think(input: AgentThinkInput): Promise<AgentThinkOutput> {
    const { state } = input;
    const actions: AgentAction[] = [];
    let reasoning = "";

    // Check HOS for all drivers
    for (const driver of state.drivers) {
      const hosCompliance = checkHOSCompliance(driver);

      if (!hosCompliance.isCompliant) {
        // Check HOS status
        actions.push({
          id: randomUUID(),
          agentType: "COMPLIANCE_MONITOR",
          action: "check_hos_status",
          input: {
            driverId: driver.id,
            currentLocation: driver.city,
          },
          result: `HOS issues detected for ${driver.name}: ${hosCompliance.issues.join(", ")}`,
          timestamp: new Date().toISOString(),
          success: true,
        });

        // Alert about violation
        for (const issue of hosCompliance.issues) {
          actions.push({
            id: randomUUID(),
            agentType: "COMPLIANCE_MONITOR",
            action: "alert_violation",
            input: {
              driverId: driver.id,
              violationType: "HOS_VIOLATION_RISK",
              severity: hosCompliance.issues.length > 1 ? "HIGH" : "MEDIUM",
            },
            result: `HOS alert for ${driver.name}: ${issue}`,
            timestamp: new Date().toISOString(),
            success: true,
          });
        }
      }

      // Validate insurance periodically
      const insurance = validateInsurance(driver);
      if (!insurance.isValid) {
        actions.push({
          id: randomUUID(),
          agentType: "COMPLIANCE_MONITOR",
          action: "validate_insurance",
          input: {
            driverId: driver.id,
          },
          result: `Insurance issues for ${driver.name}: ${insurance.issues.join(", ")}`,
          timestamp: new Date().toISOString(),
          success: true,
        });
      }

      // Check documentation
      const docTypes = ["LICENSE", "MEDICAL_CERTIFICATE", "VEHICLE_REGISTRATION"];
      for (const docType of docTypes) {
        actions.push({
          id: randomUUID(),
          agentType: "COMPLIANCE_MONITOR",
          action: "check_documentation",
          input: {
            driverId: driver.id,
            documentType: docType,
          },
          result: `${docType} checked for ${driver.name}`,
          timestamp: new Date().toISOString(),
          success: true,
        });
      }
    }

    // Generate fleet compliance report
    actions.push({
      id: randomUUID(),
      agentType: "COMPLIANCE_MONITOR",
      action: "generate_compliance_report",
      input: {
        scope: "FLEET",
      },
      result: `Fleet compliance report generated`,
      timestamp: new Date().toISOString(),
      success: true,
    });

    const driversWithIssues = state.drivers.filter(
      (d) => !checkHOSCompliance(d).isCompliant
    ).length;

    reasoning = `Compliance check completed for ${state.drivers.length} drivers. ${driversWithIssues} driver(s) have compliance issues requiring attention.`;

    return { reasoning, actions };
  }

  async execute(action: AgentAction): Promise<ToolExecutionResult> {
    const { action: actionType, input } = action;

    switch (actionType) {
      case "check_hos_status": {
        const hos = getHOSData(input.driverId as string);
        return {
          success: true,
          result: `HOS status retrieved for driver ${input.driverId}`,
          data: hos,
        };
      }

      case "validate_insurance": {
        const insurance = validateInsurance({ id: input.driverId as string } as Driver);
        return {
          success: true,
          result: `Insurance validated for driver ${input.driverId}`,
          data: insurance,
        };
      }

      case "check_documentation":
        return {
          success: true,
          result: `${input.documentType} status checked for driver ${input.driverId}`,
          data: { documentType: input.documentType, status: "VALID", expiresAt: "2027-01-01" },
        };

      case "generate_compliance_report":
        return {
          success: true,
          result: `Compliance report generated for ${input.scope}`,
          data: { scope: input.scope, timestamp: new Date().toISOString() },
        };

      case "alert_violation":
        return {
          success: true,
          result: `Violation alert sent for driver ${input.driverId}`,
          data: {
            violationType: input.violationType,
            severity: input.severity,
            timestamp: new Date().toISOString(),
          },
        };

      default:
        return {
          success: false,
          result: `Unknown action: ${actionType}`,
          error: `Tool ${actionType} not implemented`,
        };
    }
  }
}
