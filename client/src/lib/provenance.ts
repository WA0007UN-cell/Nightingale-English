export function resolveProvenanceSourceId(pointer: string | null | undefined): string | null {
  if (!pointer) return null;
  const match = pointer.match(/(?:^|\/)source_entry_id:([^/]+)/);
  return match?.[1] ?? null;
}

export function focusProvenanceSource(pointer: string | null | undefined, onOpenSource: (entryId: string) => void) {
  const sourceId = resolveProvenanceSourceId(pointer);
  if (sourceId) onOpenSource(sourceId);
  return sourceId;
}
