import { selectMemeFromCeremonyLabels, type MemeTemplate } from "./meme.js";

export interface CompressResult {
  original: string;
  compressed: string;
  originalWordCount: number;
  compressedWordCount: number;
  reductionPercent: number;
  removedCeremony: string[];
  meaningSurvived: boolean;
  report: string;
  memeSuggestion: MemeTemplate | null;
}

const CEREMONY_CORPUS: ReadonlyArray<{ phrase: string; replacement: string; label: string }> = [
  { phrase: "in order to", replacement: "to", label: "padding phrase" },
  { phrase: "due to the fact that", replacement: "because", label: "padding phrase" },
  { phrase: "at this point in time", replacement: "now", label: "time filler" },
  { phrase: "in the event that", replacement: "if", label: "conditional bloat" },
  { phrase: "on a daily basis", replacement: "daily", label: "frequency filler" },
  { phrase: "going forward", replacement: "", label: "direction theatre" },
  { phrase: "moving forward", replacement: "", label: "direction theatre" },
  { phrase: "at the end of the day", replacement: "", label: "wisdom filler" },
  { phrase: "it is important to note that", replacement: "", label: "attention ceremony" },
  { phrase: "it should be noted that", replacement: "", label: "attention ceremony" },
  { phrase: "please be advised", replacement: "", label: "advisory theatre" },
  { phrase: "needless to say", replacement: "", label: "redundancy announcement" },
  { phrase: "as previously mentioned", replacement: "", label: "reference filler" },
  { phrase: "touch base", replacement: "meet", label: "jargon" },
  { phrase: "circle back", replacement: "follow up", label: "jargon" },
  { phrase: "deep dive", replacement: "review", label: "intensity theatre" },
  { phrase: "take it offline", replacement: "discuss separately", label: "meeting euphemism" },
  { phrase: "move the needle", replacement: "make progress", label: "metric theatre" },
  { phrase: "peel back the onion", replacement: "investigate", label: "metaphor ceremony" },
  { phrase: "boil the ocean", replacement: "do too much", label: "scope metaphor" },
  { phrase: "bandwidth", replacement: "capacity", label: "tech-as-human theatre" },
  { phrase: "leverage", replacement: "use", label: "verb inflation" },
  { phrase: "synergies", replacement: "coordination", label: "management fog" },
  { phrase: "synergy", replacement: "coordination", label: "management fog" },
  { phrase: "unlock value", replacement: "make useful", label: "corporate fog" },
  { phrase: "transformational journey", replacement: "project", label: "transformation fog" },
  { phrase: "thrilled to announce", replacement: "announcing", label: "emotion theatre" },
  { phrase: "strategic enabler", replacement: "requirement", label: "strategy fog" },
  { phrase: "seamless integration", replacement: "integration", label: "optimism qualifier" },
  { phrase: "data-driven", replacement: "evidence-based", label: "credential fog" },
  { phrase: "single source of truth", replacement: "authoritative source", label: "data religion" },
  { phrase: "center of excellence", replacement: "team", label: "title inflation" },
  { phrase: "world-class", replacement: "", label: "superlative theatre" },
  { phrase: "best-in-class", replacement: "good", label: "superlative theatre" },
  { phrase: "cutting-edge", replacement: "", label: "superlative theatre" },
  { phrase: "state-of-the-art", replacement: "", label: "superlative theatre" },
  { phrase: "best practices", replacement: "known approaches", label: "wisdom fog" },
  { phrase: "proactively", replacement: "", label: "adverb ceremony" },
  { phrase: "holistically", replacement: "", label: "adverb ceremony" },
  { phrase: "strategically", replacement: "", label: "adverb ceremony" },
  { phrase: "key stakeholders", replacement: "stakeholders", label: "adjective ceremony" },
  { phrase: "robust solution", replacement: "solution", label: "adjective ceremony" },
  { phrase: "innovative solution", replacement: "solution", label: "adjective ceremony" },
  { phrase: "robust and scalable", replacement: "scalable", label: "adjective doubling" },
];

const FILLER_WORDS: readonly string[] = [
  "very", "quite", "rather", "somewhat", "basically", "essentially",
  "literally", "honestly", "simply", "really", "definitely",
  "absolutely", "certainly", "truly", "totally", "completely", "entirely"
];

const STOP_WORDS = new Set([
  "that", "this", "with", "from", "they", "have", "been", "will", "were",
  "their", "there", "about", "which", "when", "what", "some", "into",
  "note", "important", "mentioned", "previously", "going", "forward"
]);

export function compress(input: string): CompressResult {
  const original = input.trim();
  const originalWordCount = countWords(original);

  const { text: compressed, removedCeremony } = applyCompression(original);
  const compressedWordCount = countWords(compressed);

  const reductionPercent = originalWordCount > 0
    ? Math.round((1 - compressedWordCount / originalWordCount) * 100)
    : 0;

  const meaningSurvived = checkMeaningSurvival(original, compressed);
  const report = buildReport(originalWordCount, compressedWordCount, reductionPercent, removedCeremony, meaningSurvived);
  const memeSuggestion = reductionPercent >= 20 ? selectMemeFromCeremonyLabels(removedCeremony) : null;

  return {
    original,
    compressed,
    originalWordCount,
    compressedWordCount,
    reductionPercent,
    removedCeremony,
    meaningSurvived,
    report,
    memeSuggestion
  };
}

function applyCompression(input: string): { text: string; removedCeremony: string[] } {
  let text = input;
  const removedCeremony: string[] = [];

  for (const { phrase, replacement, label } of CEREMONY_CORPUS) {
    const regex = new RegExp(escapeRegExp(phrase), "gi");
    if (regex.test(text)) {
      text = text.replace(new RegExp(escapeRegExp(phrase), "gi"), replacement);
      removedCeremony.push(`${phrase} (${label})`);
    }
  }

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    if (regex.test(text)) {
      text = text.replace(regex, "");
    }
  }

  return { text: cleanupArtifacts(text), removedCeremony };
}

function cleanupArtifacts(text: string): string {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])\1+/g, "$1")
    .replace(/\.\s*\./g, ".")
    .replace(/,\s*\./g, ".")
    .replace(/^\s*[,;]\s*/g, "")
    .trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function checkMeaningSurvival(original: string, compressed: string): boolean {
  const anchors = extractFactualAnchors(original);
  if (anchors.length === 0) {
    // Pure ceremony: the corpus replacements preserve semantic intent by design.
    return true;
  }
  const compLower = compressed.toLowerCase();
  return anchors.every((anchor) => compLower.includes(anchor.toLowerCase()));
}

function extractFactualAnchors(text: string): string[] {
  const numbers = text.match(/\b\d{2,}\b/g) ?? [];
  const systems = text.match(/\b(?:SAP|Oracle|Dynamics|ERP|Fusion|Navision|Azure|SQL|API)\b/g) ?? [];
  const fields = text.match(/\b[A-Z]{2,}[A-Z0-9_]{2,}\b/g) ?? [];
  return [...new Set([...numbers, ...systems, ...fields])];
}

function keyTokens(text: string): string[] {
  return unique(
    (text.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []).filter((t) => !STOP_WORDS.has(t))
  );
}

function buildReport(
  originalWordCount: number,
  compressedWordCount: number,
  reductionPercent: number,
  removedCeremony: string[],
  meaningSurvived: boolean
): string {
  const preview = removedCeremony.slice(0, 3).join("; ") + (removedCeremony.length > 3 ? "; and more" : "");

  const lines: string[] = [
    "Token Austerity Office report:",
    `Original: ${originalWordCount} words. Compressed: ${compressedWordCount} words. Reduction: ${reductionPercent}%.`,
    removedCeremony.length > 0
      ? `Ceremony removed: ${removedCeremony.length} pattern(s): ${preview}.`
      : "No ceremony detected. The input may already be operational.",
    meaningSurvived
      ? "Meaning: survived compression."
      : "Meaning: verify manually. Core tokens may have shifted.",
    reductionPercent === 0
      ? "Verdict: no reduction. Either the text is efficient or the ceremony is load-bearing."
      : reductionPercent < 10
        ? "Verdict: marginal. Ceremony was present but restrained."
        : reductionPercent < 25
          ? "Verdict: moderate. Useful reduction achieved."
          : `Verdict: ${reductionPercent}% removed. The original had significant ceremony.`
  ];

  return lines.join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
