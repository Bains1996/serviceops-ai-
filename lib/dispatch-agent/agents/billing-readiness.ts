import { randomUUID } from "crypto";
import { DispatchState, Load } from "../types";
import { Agent, AgentThinkInput, AgentThinkOutput, AgentAction, ToolExecutionResult, ToolDefinition } from "./types";

const TOOLS: ToolDefinition[] = [
  {
    name: "validate_pod",
    description: "Validate Proof of Delivery (POD) documentation for a completed load",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the delivered load", required: true },
      { name: "documents", type: "array", description: "List of document URLs/types to validate", required: true },
    ],
  },
  {
    name: "generate_invoice",
    description: "Generate invoice for a completed load with all required documentation",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load to invoice", required: true },
      { name: "rate", type: "number", description: "Agreed rate for the load", required: true },
      { name: "currency", type: "string", description: "Currency code (CAD, USD)", required: false },
    ],
  },
  {
    name: "check_billing_requirements",
    description: "Check what documents are required for billing a specific load",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load", required: true },
      { name: "customer", type: "string", description: "Customer name for billing requirements", required: true },
    ],
  },
  {
    name: "submit_to_accounting",
    description: "Submit completed load documentation to accounting system",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load", required: true },
      { name: "invoiceId", type: "string", description: "Generated invoice ID", required: true },
    ],
  },
  {
    name: "track_payment_status",
    description: "Track payment status and follow up on overdue invoices",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load", required: false },
      { name: "invoiceId", type: "string", description: "ID of the invoice", required: false },
    ],
  },
];

const REQUIRED_DOCUMENTS = [
  "PROOF_OF_DELIVERY",
  "BILL_OF_LADING",
  "WEIGHT_TICKET",
  "CUSTOMER_RECEIPT",
  "PHOTOS",
];

function validatePODDocuments(documents: string[]): {
  isValid: boolean;
  missing: string[];
  provided: string[];
  completeness: number;
} {
  const provided = documents.map((d) => d.toUpperCase().replace(/[- ]/g, "_"));
  const missing = REQUIRED_DOCUMENTS.filter((req) => !provided.includes(req));
  const completeness = ((REQUIRED_DOCUMENTS.length - missing.length) / REQUIRED_DOCUMENTS.length) * 100;

  return {
    isValid: missing.length === 0,
    missing,
    provided,
    completeness,
  };
}

function calculateInvoiceAmount(load: Load): {
  baseRate: number;
  fuelSurcharge: number;
  detention: number;
  total: number;
  currency: string;
} {
  const baseRate = load.rateCad;
  const fuelSurcharge = baseRate * 0.15; // 15% fuel surcharge
  const detention = 0; // Would be calculated based on time at shipper/receiver

  return {
    baseRate,
    fuelSurcharge,
    detention,
    total: baseRate + fuelSurcharge + detention,
    currency: "CAD",
  };
}

function getBillingRequirements(customer: string): string[] {
  // Different customers may have different requirements
  const baseRequirements = [
    "PROOF_OF_DELIVERY",
    "BILL_OF_LADING",
  ];

  const customerRequirements: Record<string, string[]> = {
    "WALMART": ["PROOF_OF_DELIVERY", "BILL_OF_LADING", "WEIGHT_TICKET", "CUSTOMER_RECEIPT"],
    "COSTCO": ["PROOF_OF_DELIVERY", "BILL_OF_LADING", "PHOTOS"],
    "LOBLAWS": ["PROOF_OF_DELIVERY", "BILL_OF_LADING", "TEMPERATURE_LOG"],
  };

  return customerRequirements[customer.toUpperCase()] || baseRequirements;
}

export class BillingReadiness implements Agent {
  type = "BILLING_READINESS" as const;
  name = "Billing Readiness";
  description = "Manages POD collection, invoice generation, and billing workflows";
  tools = TOOLS;

  getSystemPrompt(): string {
    return `You are the Billing Readiness agent for ServiceOps AI, a trucking dispatch operations platform.

Your role is to:
1. Validate Proof of Delivery (POD) documentation
2. Ensure all required billing documents are collected
3. Generate accurate invoices for completed loads
4. Submit documentation to accounting systems
5. Track payment status and follow up on overdue invoices

Standard billing documents:
- Proof of Delivery (POD) - signed by consignee
- Bill of Lading (BOL) - original or digital copy
- Weight Ticket - for weight-based loads
- Customer Receipt - confirmation of delivery
- Photos - damage documentation if applicable
- Temperature Log - for reefer loads

Billing process:
1. Load delivered → AI validates POD completeness
2. Missing documents → AI requests from driver via SMS
3. Documents complete → AI generates invoice
4. Invoice submitted → Accounting processes payment
5. Payment received → Load marked as PAID

Best practices:
- Validate documents within 24 hours of delivery
- Generate invoices within 48 hours of POD completion
- Follow up on overdue payments at 30, 60, 90 days
- Maintain audit trail for all billing activities

Be thorough but efficient. Automate where possible, escalate when needed.`;
  }

  async think(input: AgentThinkInput): Promise<AgentThinkOutput> {
    const { state } = input;
    const actions: AgentAction[] = [];
    let reasoning = "";

    // Find delivered loads that need billing processing
    const deliveredLoads = state.loads.filter((l) => l.status === "DELIVERED");

    if (deliveredLoads.length === 0) {
      reasoning = "No delivered loads requiring billing processing at this time.";
      return { reasoning, actions };
    }

    for (const load of deliveredLoads.slice(0, 5)) {
      // Check billing requirements
      actions.push({
        id: randomUUID(),
        agentType: "BILLING_READINESS",
        action: "check_billing_requirements",
        input: {
          loadId: load.id,
          customer: load.customer,
        },
        result: `Billing requirements checked for ${load.customer}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Validate POD (simulated documents)
      const documents = ["PROOF_OF_DELIVERY", "BILL_OF_LADING"]; // Simulated partial docs
      const podValidation = validatePODDocuments(documents);

      actions.push({
        id: randomUUID(),
        agentType: "BILLING_READINESS",
        action: "validate_pod",
        input: {
          loadId: load.id,
          documents,
        },
        result: podValidation.isValid
          ? `POD validated for ${load.id}`
          : `POD incomplete for ${load.id}: missing ${podValidation.missing.join(", ")}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Generate invoice if POD is complete
      if (podValidation.isValid) {
        const invoiceAmount = calculateInvoiceAmount(load);

        actions.push({
          id: randomUUID(),
          agentType: "BILLING_READINESS",
          action: "generate_invoice",
          input: {
            loadId: load.id,
            rate: invoiceAmount.baseRate,
            currency: invoiceAmount.currency,
          },
          result: `Invoice generated: $${invoiceAmount.total.toFixed(2)} CAD for ${load.id}`,
          timestamp: new Date().toISOString(),
          success: true,
        });

        // Submit to accounting
        actions.push({
          id: randomUUID(),
          agentType: "BILLING_READINESS",
          action: "submit_to_accounting",
          input: {
            loadId: load.id,
            invoiceId: `INV-${load.id}`,
          },
          result: `Invoice submitted to accounting for ${load.id}`,
          timestamp: new Date().toISOString(),
          success: true,
        });
      } else {
        // Request missing documents from driver
        reasoning += ` Load ${load.id} missing: ${podValidation.missing.join(", ")}. `;
      }
    }

    reasoning += `Processed ${deliveredLoads.length} delivered loads for billing readiness.`;

    return { reasoning, actions };
  }

  async execute(action: AgentAction): Promise<ToolExecutionResult> {
    const { action: actionType, input } = action;

    switch (actionType) {
      case "validate_pod": {
        const validation = validatePODDocuments(input.documents as string[]);
        return {
          success: true,
          result: `POD validation completed`,
          data: validation,
        };
      }

      case "generate_invoice": {
        const amount = calculateInvoiceAmount({ rateCad: input.rate as number } as Load);
        return {
          success: true,
          result: `Invoice generated: $${amount.total.toFixed(2)}`,
          data: amount,
        };
      }

      case "check_billing_requirements": {
        const requirements = getBillingRequirements(input.customer as string);
        return {
          success: true,
          result: `Billing requirements retrieved for ${input.customer}`,
          data: { requirements },
        };
      }

      case "submit_to_accounting":
        return {
          success: true,
          result: `Invoice submitted to accounting`,
          data: {
            loadId: input.loadId,
            invoiceId: input.invoiceId,
            timestamp: new Date().toISOString(),
          },
        };

      case "track_payment_status":
        return {
          success: true,
          result: `Payment status tracked`,
          data: {
            loadId: input.loadId,
            invoiceId: input.invoiceId,
            status: "PENDING",
            daysSinceSubmission: 0,
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
