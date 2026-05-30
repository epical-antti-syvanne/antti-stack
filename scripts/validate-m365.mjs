import { readFileSync } from "node:fs";

const files = [
  "adapters/m365-copilot/appPackage/manifest.json",
  "adapters/m365-copilot/appPackage/declarativeAgent.json"
];

for (const file of files) {
  const raw = readFileSync(file);
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    throw new Error(`${file} contains a UTF-8 BOM; Microsoft packaging tools may become theatrical.`);
  }

  const parsed = JSON.parse(raw.toString("utf8"));
  if (!parsed.name && !parsed.manifestVersion) {
    throw new Error(`${file} does not look like an app or declarative agent manifest.`);
  }
}

console.log("M365 adapter scaffold is valid JSON.");