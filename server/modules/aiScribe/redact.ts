export type RedactionResult = { redactedText: string; redactions: string[] };

const PHONE_PATTERN = /(?<!\d)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?!\d)/g;
const IC_ID_PATTERN = /\b(?:IC|ID|NRIC|PASSPORT)\s*[:#-]?\s*[A-Z0-9][A-Z0-9-]{4,20}\b|(?<!\d)\d{6}-?\d{2}-?\d{4}(?!\d)/gi;
const LABELLED_NAME_PATTERN = /\b(?:patient|name|mr\.?|mrs\.?|ms\.?|dr\.?|doctor|nurse)\s*[:#-]?\s+[A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,3}/g;

function replaceWithToken(text: string, pattern: RegExp, token: string, redactions: string[]) {
  return text.replace(pattern, (match) => {
    redactions.push(match);
    return token;
  });
}

/** Server-only deterministic baseline. It must run before any provider/LLM boundary. */
export function redactPhi(text: string, knownNames: string[] = []): RedactionResult {
  const redactions: string[] = [];
  let redactedText = text;
  redactedText = replaceWithToken(redactedText, PHONE_PATTERN, "[REDACTED_PHONE]", redactions);
  redactedText = replaceWithToken(redactedText, IC_ID_PATTERN, "[REDACTED_ID]", redactions);
  redactedText = replaceWithToken(redactedText, LABELLED_NAME_PATTERN, "[REDACTED_NAME]", redactions);
  for (const name of [...knownNames].sort((a, b) => b.length - a.length)) {
    if (!name.trim()) continue;
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    redactedText = redactedText.replace(new RegExp(`\\b${escaped}\\b`, "gi"), (match) => {
      redactions.push(match);
      return "[REDACTED_NAME]";
    });
  }
  return { redactedText, redactions };
}
