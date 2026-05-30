export interface NavigationStep {
  purpose: string;
  paths: string[];
}

export interface ArchaeologyGuide {
  detectedSystem: string | null;
  detectedModule: string | null;
  detectedObjects: string[];
  detectedFields: string[];
  detectedYears: string[];
  navigationSteps: NavigationStep[];
  followUpQuestions: string[];
}

const SAP_MODULE_PATTERNS: Array<{ pattern: RegExp; module: string }> = [
  { pattern: /\b(vendor|supplier|LFA1|LFM1|XK0|BP)\b/i, module: "MM/FI (Vendor Master)" },
  { pattern: /\b(invoice|MIRO|RBKP|RSEG|MIR4|MRBR)\b/i, module: "FI/MM (Invoice)" },
  { pattern: /\b(material|MARA|MARC|MM0[0-9])\b/i, module: "MM (Material Master)" },
  { pattern: /\b(customer|KNA1|XD0|SD)\b/i, module: "SD/FI (Customer)" },
  { pattern: /\b(purchase.?order|PO|EKKO|EKPO|ME2[0-9])\b/i, module: "MM (Purchasing)" },
  { pattern: /\b(GL|SKA1|FS00|general.?ledger)\b/i, module: "FI (General Ledger)" }
];

const ORACLE_MODULE_PATTERNS: Array<{ pattern: RegExp; module: string }> = [
  { pattern: /\b(AP|payable|invoice|AP_INVOICES)\b/i, module: "AP (Accounts Payable)" },
  { pattern: /\b(PO|purchase|PO_VENDORS|PO_HEADERS)\b/i, module: "PO (Purchasing)" },
  { pattern: /\b(AR|receivable|HZ_PARTIES|customer)\b/i, module: "AR (Accounts Receivable)" },
  { pattern: /\b(GL|ledger|GL_JE)\b/i, module: "GL (General Ledger)" }
];

function detectSystem(input: string): string | null {
  if (/\bSAP\b/i.test(input)) return "SAP";
  // Z*/Y* custom field naming is a SAP convention
  if (/\b[ZY][A-Z0-9_]{3,}\b/.test(input)) return "SAP";
  // SAP transaction code patterns: 2-4 uppercase letters + digits
  if (/\b(SE11|SE16|SE80|SE93|XK0[0-9]|MM0[0-9]|MIR[0-9]|MIRO|CDHDR|CDPOS|LFA1|LFM1|MARA|MARC|KNA1|RBKP|RSEG|EKKO|EKPO)\b/.test(input)) return "SAP";
  if (/\bOracle\s*(EBS|Fusion|R12)?\b/i.test(input)) return "Oracle";
  if (/\b(Dynamics|D365|AX|NAV|Navision)\b/i.test(input)) return "Dynamics 365";
  if (/\bFusion\b/i.test(input)) return "Oracle Fusion";
  if (/\bWorkday\b/i.test(input)) return "Workday";
  return null;
}

function detectModule(input: string, system: string | null): string | null {
  if (system === "SAP") {
    for (const { pattern, module } of SAP_MODULE_PATTERNS) {
      if (pattern.test(input)) return module;
    }
  }
  if (system === "Oracle" || system === "Oracle Fusion") {
    for (const { pattern, module } of ORACLE_MODULE_PATTERNS) {
      if (pattern.test(input)) return module;
    }
  }
  return null;
}

function detectObjects(input: string): string[] {
  const objects: string[] = [];
  if (/\b(vendor|supplier)\b/i.test(input)) objects.push("vendor/supplier record");
  if (/\b(invoice)\b/i.test(input)) objects.push("invoice record");
  if (/\b(material|item|product)\b/i.test(input)) objects.push("material/product record");
  if (/\b(customer)\b/i.test(input)) objects.push("customer record");
  if (/\b(purchase.?order|PO)\b/i.test(input)) objects.push("purchase order");
  if (/\b(mapping|field.?mapping)\b/i.test(input)) objects.push("field mapping");
  return objects;
}

function detectFields(input: string): string[] {
  const custom = input.match(/\b[ZY][A-Z0-9_]{2,}\b/g) ?? [];
  const standard = input.match(/\b[A-Z]{2,6}\d*_[A-Z0-9_]{2,}\b/g) ?? [];
  return [...new Set([...custom, ...standard])].slice(0, 6);
}

function detectYears(input: string): string[] {
  return [...new Set(input.match(/\b20\d{2}\b/g) ?? [])];
}

function buildSapNavigation(module: string | null, fields: string[], years: string[], objects: string[]): NavigationStep[] {
  const steps: NavigationStep[] = [];
  const customFields = fields.filter(f => /^[ZY]/.test(f));
  const hasCustomField = customFields.length > 0;
  const hasVendor = objects.some(o => o.includes("vendor"));
  const hasInvoice = objects.some(o => o.includes("invoice"));
  const hasMaterial = objects.some(o => o.includes("material"));

  if (hasCustomField) {
    steps.push({
      purpose: "Where this field is defined",
      paths: [
        `SE11 → enter field name (${customFields.join(", ")}) → Display`,
        "SE11 → check which table contains this field — look at the Where-Used list",
        "TADIR → filter by object type TABD to find the development package it belongs to"
      ]
    });
    steps.push({
      purpose: "What writes to this field",
      paths: [
        `SE11 → field name → Where-Used List → look for ABAP programs, BAPIs, user exits`,
        "SE80 → search for field name in repository → shows all code that references it",
        "Check for Z transactions (SE93) or enhancement spots (SE18) that populate it"
      ]
    });
  }

  if (hasVendor) {
    steps.push({
      purpose: "Where the vendor record is defined",
      paths: [
        "BP (Business Partner) — primary in S/4HANA",
        "XK03 / XK01 — vendor display/create in older SAP ECC",
        "Tables: LFA1 (general data), LFM1 (purchasing org data), LFB1 (company code data)"
      ]
    });
  }

  if (hasInvoice) {
    steps.push({
      purpose: "Where the invoice record is defined",
      paths: [
        "MIRO — post invoice, MIR4 — display invoice document",
        "Tables: RBKP (invoice header), RSEG (invoice line items)",
        "MIR7 — parked invoices if the invoice is stuck in workflow"
      ]
    });
  }

  if (hasMaterial) {
    steps.push({
      purpose: "Where the material record is defined",
      paths: [
        "MM03 — display material master",
        "Tables: MARA (general data), MARC (plant data), MARD (storage location data)"
      ]
    });
  }

  if (years.length > 0) {
    steps.push({
      purpose: `What changed around ${years.join(", ")}`,
      paths: [
        "CDHDR / CDPOS — change document tables. Filter by object class and date range.",
        "SE16 → CDHDR → filter UDATE (change date) for the year range",
        "SCU3 — table history if change logging is active for the relevant table",
        "Check transport log (SE09/SE10) for changes released in that year"
      ]
    });
  }

  steps.push({
    purpose: "Who owns this",
    paths: [
      "SE10 — find transports from that period, check the developer name",
      "TADIR — find the package owner, then check the team responsible for that package",
      "If it is a Z field: the team that developed it is responsible. Find the package in SE11."
    ]
  });

  return steps;
}

function buildOracleNavigation(module: string | null, fields: string[], years: string[], objects: string[]): NavigationStep[] {
  const steps: NavigationStep[] = [];
  const hasVendor = objects.some(o => o.includes("vendor"));
  const hasInvoice = objects.some(o => o.includes("invoice"));

  if (hasVendor) {
    steps.push({
      purpose: "Where the vendor record is defined",
      paths: [
        "EBS: Suppliers form → Payables > Suppliers > Entry",
        "Tables: HZ_PARTIES (party), PO_VENDORS (supplier), AP_SUPPLIERS (view)",
        "Fusion: Procurement > Suppliers > Manage Suppliers"
      ]
    });
  }

  if (hasInvoice) {
    steps.push({
      purpose: "Where the invoice record is defined",
      paths: [
        "EBS: Payables > Invoices > Inquiry > Invoices",
        "Table: AP_INVOICES_ALL (header), AP_INVOICE_LINES_ALL (lines)",
        "Fusion: Payables > Invoices > Manage Invoices"
      ]
    });
  }

  if (fields.length > 0) {
    steps.push({
      purpose: "Where custom fields are defined",
      paths: [
        "Descriptive Flexfields (DFF) — System Administrator > Flexfields > Descriptive > Segments",
        "Application Object Library: check FND_DESCR_FLEX_COLUMN_USAGES",
        "Fusion: Application Composer (if extensible) or Sandbox for flexfields"
      ]
    });
  }

  if (years.length > 0) {
    steps.push({
      purpose: `What changed around ${years.join(", ")}`,
      paths: [
        "FND_CONCURRENT_REQUESTS — find batch jobs run in that period",
        "WF_ITEMS — workflow audit trail if approval workflow is used",
        "Check patch history: AD_PATCHES for EBS patches applied around that date"
      ]
    });
  }

  return steps;
}

function buildDynamicsNavigation(module: string | null, fields: string[], years: string[], objects: string[]): NavigationStep[] {
  const steps: NavigationStep[] = [];
  const hasVendor = objects.some(o => o.includes("vendor"));
  const hasInvoice = objects.some(o => o.includes("invoice"));

  if (hasVendor) {
    steps.push({
      purpose: "Where the vendor record is defined",
      paths: [
        "Accounts Payable > Vendors > All vendors",
        "D365 table: VendTable (vendor master), VendGroup (vendor group)"
      ]
    });
  }

  if (hasInvoice) {
    steps.push({
      purpose: "Where the invoice record is defined",
      paths: [
        "Accounts Payable > Invoices > Pending vendor invoices",
        "D365 table: VendInvoiceInfoTable (invoice header), VendInvoiceInfoLine (lines)"
      ]
    });
  }

  if (fields.length > 0) {
    steps.push({
      purpose: "Where custom fields are defined",
      paths: [
        "System administration > Workspace > Data management > Framework parameters",
        "Extension fields: check the ISV or custom model that added the field in Visual Studio / LCS",
        "Database: query FIELDS or use SQL Management Studio on the AOS database"
      ]
    });
  }

  return steps;
}

function buildGenericNavigation(fields: string[], years: string[], objects: string[]): NavigationStep[] {
  const steps: NavigationStep[] = [];

  steps.push({
    purpose: "What system and module owns this record",
    paths: [
      "Check the data dictionary or metadata catalog for the field definition",
      "Find the team responsible for the domain (vendor, invoice, material) — they own the record definition",
      "If there is an integration: find the canonical source system — that is where the record is defined"
    ]
  });

  if (fields.length > 0) {
    steps.push({
      purpose: "Where custom fields are defined",
      paths: [
        "Check the data dictionary / table browser for the field owner",
        "Search the codebase or configuration for where this field is populated",
        "Find the migration or interface log that last wrote to it"
      ]
    });
  }

  if (years.length > 0) {
    steps.push({
      purpose: `What changed around ${years.join(", ")}`,
      paths: [
        "Check change log / audit trail tables for that date range",
        "Find what went live in that period: release notes, migration records, reorg history",
        "The most useful signal: what project closed in that year and left this as a permanent temporary fix"
      ]
    });
  }

  return steps;
}

function buildFollowUpQuestions(system: string | null, module: string | null, fields: string[], objects: string[]): string[] {
  const questions: string[] = [];

  if (!system) {
    questions.push("Which ERP system is involved? (SAP, Oracle EBS, Oracle Fusion, Dynamics 365, Workday, or other)");
  }

  if (system && !module) {
    if (system === "SAP") {
      questions.push("Which SAP module? MM (materials/vendors), FI (finance/invoices), SD (sales/customers), or another?");
      questions.push("S/4HANA or older SAP ECC? Transaction codes differ.");
    } else if (system === "Oracle") {
      questions.push("Oracle EBS or Oracle Fusion? Navigation and table names differ significantly.");
      questions.push("Which module? AP (payables), AR (receivables), PO (purchasing), or GL?");
    } else if (system === "Dynamics 365") {
      questions.push("D365 Finance, D365 Supply Chain, or Business Central? They share some tables but not all.");
    }
  }

  const customFields = fields.filter(f => /^[ZY]/.test(f));
  if (customFields.length > 0 && system === "SAP") {
    questions.push(`Is ${customFields[0]} in a standard SAP table (append structure) or a completely custom Z table?`);
    questions.push("Is there a Z transaction or custom program that populates this field, or is it set by an interface?");
  }

  if (objects.length === 0) {
    questions.push("What type of record is involved? Vendor, customer, material, invoice, or something else?");
  }

  if (fields.length === 0 && objects.length > 0) {
    questions.push("What is the specific field or value that is wrong? A field name or column name would help narrow down where to look.");
  }

  return questions;
}

export function buildArchaeologyGuide(input: string): ArchaeologyGuide {
  const detectedSystem = detectSystem(input);
  const detectedModule = detectModule(input, detectedSystem);
  const detectedObjects = detectObjects(input);
  const detectedFields = detectFields(input);
  const detectedYears = detectYears(input);

  let navigationSteps: NavigationStep[];
  if (detectedSystem === "SAP") {
    navigationSteps = buildSapNavigation(detectedModule, detectedFields, detectedYears, detectedObjects);
  } else if (detectedSystem === "Oracle" || detectedSystem === "Oracle Fusion") {
    navigationSteps = buildOracleNavigation(detectedModule, detectedFields, detectedYears, detectedObjects);
  } else if (detectedSystem === "Dynamics 365") {
    navigationSteps = buildDynamicsNavigation(detectedModule, detectedFields, detectedYears, detectedObjects);
  } else {
    navigationSteps = buildGenericNavigation(detectedFields, detectedYears, detectedObjects);
  }

  const followUpQuestions = buildFollowUpQuestions(detectedSystem, detectedModule, detectedFields, detectedObjects);

  return {
    detectedSystem,
    detectedModule,
    detectedObjects,
    detectedFields,
    detectedYears,
    navigationSteps,
    followUpQuestions
  };
}
