/** Stored on the Hero document and parsed by the live site. */
export const TRUST_STRIP_SEPARATOR = "•";

export function trustStripToEditorPoints(trustStrip: string): string[] {
  if (!trustStrip.trim()) return [""];
  return trustStrip
    .split(TRUST_STRIP_SEPARATOR)
    .map((segment) => segment.trim());
}

export function editorPointsToTrustStrip(points: string[]): string {
  return points
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join(` ${TRUST_STRIP_SEPARATOR} `);
}

export function trustStripSegments(trustStrip: string): string[] {
  return trustStrip
    .split(TRUST_STRIP_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
}
