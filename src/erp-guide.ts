export interface InvestigationPhase {
  name: string;
  questions: string[];
  systemHint?: string;   // ERP-specific guidance, only when system is known
}

export interface ArchaeologyGuide {
  detectedSystem: string | null;
  detectedFields: string[];
  detectedYears: string[];
  summary: string;
  phases: InvestigationPhase[];
}

function detectSystem(input: string): string | null {
  if (/\bSAP\b/i.test(input)) return "SAP";
  if (/\b[ZY][A-Z0-9_]{3,}\b/.test(input)) return "SAP";
  if (/\b(SE11|SE16|SE80|CDHDR|LFA1|LFM1|MARA|RBKP|EKKO)\b/.test(input)) return "SAP";
  if (/\bOracle\s*(EBS|Fusion|R12)?\b/i.test(input)) return "Oracle";
  if (/\b(Dynamics|D365|AX|NAV|Navision)\b/i.test(input)) return "Dynamics 365";
  if (/\bFusion\b/i.test(input)) return "Oracle Fusion";
  if (/\bWorkday\b/i.test(input)) return "Workday";
  return null;
}

function detectFields(input: string): string[] {
  const custom = input.match(/\b[ZY][A-Z0-9_]{2,}\b/g) ?? [];
  const standard = input.match(/\b[A-Z]{2,6}_[A-Z0-9_]{2,}\b/g) ?? [];
  return [...new Set([...custom, ...standard])].slice(0, 4);
}

function detectYears(input: string): string[] {
  return [...new Set(input.match(/\b20\d{2}\b/g) ?? [])];
}

function sapHint(action: string): string {
  const hints: Record<string, string> = {
    "field-whereused":    "SAP: SE11 → field name → Where-Used List",
    "field-definition":   "SAP: SE11 → enter field name → Display field attributes and table",
    "change-history":     "SAP: CDHDR/CDPOS → filter by object class and date range",
    "transport-history":  "SAP: SE10 → filter by date, find developer and package",
    "code-that-writes":   "SAP: SE80 → search for field name across repository",
    "vendor-record":      "SAP: BP (S/4HANA) or XK03 (ECC) → LFA1, LFM1 tables",
    "invoice-record":     "SAP: MIR4 → RBKP (header), RSEG (lines) tables",
    "material-record":    "SAP: MM03 → MARA (general), MARC (plant) tables"
  };
  return hints[action] ?? "";
}

function oracleHint(action: string): string {
  const hints: Record<string, string> = {
    "field-definition":   "Oracle: check Descriptive Flexfields in System Administrator → Flexfields",
    "change-history":     "Oracle EBS: FND_CONCURRENT_REQUESTS, WF_ITEMS for workflow audit",
    "vendor-record":      "Oracle: HZ_PARTIES, PO_VENDORS tables — Payables > Suppliers",
    "invoice-record":     "Oracle: AP_INVOICES_ALL (header), AP_INVOICE_LINES_ALL (lines)"
  };
  return hints[action] ?? "";
}

function dynamicsHint(action: string): string {
  const hints: Record<string, string> = {
    "field-definition":   "D365: check extension model in LCS or Visual Studio — field is in a custom layer",
    "change-history":     "D365: SysDataEventMonitor or audit log if enabled — check system administration",
    "vendor-record":      "D365: Accounts Payable > Vendors — VendTable in SQL",
    "invoice-record":     "D365: Accounts Payable > Invoices — VendInvoiceInfoTable"
  };
  return hints[action] ?? "";
}

function hint(system: string | null, action: string): string | undefined {
  if (system === "SAP") return sapHint(action) || undefined;
  if (system === "Oracle" || system === "Oracle Fusion") return oracleHint(action) || undefined;
  if (system === "Dynamics 365") return dynamicsHint(action) || undefined;
  return undefined;
}

export function buildArchaeologyGuide(input: string): ArchaeologyGuide {
  const detectedSystem = detectSystem(input);
  const detectedFields = detectFields(input);
  const detectedYears = detectYears(input);

  const fieldLabel = detectedFields.length > 0
    ? detectedFields.join(", ")
    : "the relevant field or record";

  const yearLabel = detectedYears.length > 0
    ? detectedYears.join(", ")
    : null;

  const summaryParts: string[] = [];
  if (detectedSystem) summaryParts.push(detectedSystem);
  if (detectedFields.length > 0) summaryParts.push(`field: ${detectedFields.join(", ")}`);
  if (yearLabel) summaryParts.push(`year reference: ${yearLabel}`);
  const summary = summaryParts.length > 0
    ? summaryParts.join(" · ")
    : "no system or field identified — see Phase 1";

  const phases: InvestigationPhase[] = [
    {
      name: "Phase 1 — What systems does this data touch?",
      questions: [
        `Where does ${fieldLabel} live? Is it in one system or synchronized across several?`,
        "Is there a source system that owns this record, or is it created inside the current system?",
        "Are there interfaces, APIs, flat files, or scheduled jobs that read or write this data?",
        "Is there a downstream system, report, or Excel file that also holds a copy of this value?",
        ...(!detectedSystem ? [
          "Which ERP system is this in? (SAP, Oracle EBS, Oracle Fusion, Dynamics 365, Workday, or other)"
        ] : [])
      ],
      systemHint: hint(detectedSystem, "field-whereused")
    },
    {
      name: "Phase 2 — What business process does this data support?",
      questions: [
        `What process depends on ${fieldLabel}? (invoicing, vendor payment, reporting, ordering, compliance)`,
        "Who creates or enters this record — which team, which role, which transaction?",
        "Who reads it and what do they do with it?",
        "What breaks or is wrong when this value is incorrect? What is the operational impact?"
      ],
      systemHint: hint(detectedSystem,
        /vendor|supplier/i.test(input) ? "vendor-record" :
        /invoice/i.test(input) ? "invoice-record" :
        /material/i.test(input) ? "material-record" : "field-definition"
      )
    },
    {
      name: "Phase 3 — Where did the wrong value come from?",
      questions: [
        `Is ${fieldLabel} wrong at the source, or correct at the source and corrupted in transit?`,
        "What populates this field — manual entry, a program, an interface, a migration, or a default value?",
        `${yearLabel ? `Was it correct before ${yearLabel} and wrong after? Or wrong from the beginning?` : "Was this ever correct? If so, when did it change?"}`,
        "Is there a user exit, BAPI, enhancement, or custom program that sets this value?",
        "Is there a manual override or correction step somewhere in the process?"
      ],
      systemHint: hint(detectedSystem, "code-that-writes")
    },
    {
      name: "Phase 4 — What changed, and when?",
      questions: [
        yearLabel
          ? `What went live around ${yearLabel}? A migration, a project closure, a system upgrade, a reorg?`
          : "When did this problem start? What project or change was active at that time?",
        "Is there someone who knew how this worked before — a consultant, a key user, a person now in a different role?",
        "Was there a data migration? If so, what was the transformation logic and who signed it off?",
        "Is the wrong value consistent (same wrong value every time) or random? Consistent means a rule. Random means an interface timing issue or manual error."
      ],
      systemHint: hint(detectedSystem, yearLabel ? "change-history" : "transport-history")
    }
  ];

  return { detectedSystem, detectedFields, detectedYears, summary, phases };
}
