/**
 * Keep in sync with craftech-backend-ts/src/domain/tenancy/host.ts
 * (validatePublicHostInput).
 */
export const DOMAIN_HOST_MAX_LENGTH = 253;
export const DOMAIN_LABEL_MAX_LENGTH = 63;

const HOST_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function validateDomainHostInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Domain is required";

  let value = trimmed.toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0] ?? "";
  const withoutPort =
    value.includes(":") && !value.startsWith("[") ? value.split(":")[0] : value;
  const host = withoutPort || null;
  if (!host) return "Enter a valid domain";

  if (host.length > DOMAIN_HOST_MAX_LENGTH) {
    return `Domain name has more than ${DOMAIN_HOST_MAX_LENGTH} characters`;
  }
  if (host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return null;
  }

  for (const label of host.split(".")) {
    if (!label) return "Enter a valid domain";
    if (label.length > DOMAIN_LABEL_MAX_LENGTH) {
      return `Each part of the domain has more than ${DOMAIN_LABEL_MAX_LENGTH} characters`;
    }
    if (!HOST_LABEL.test(label)) {
      return "Use only letters, numbers, and hyphens. Hyphens cannot start or end a part.";
    }
  }
  return null;
}

export const DOMAIN_HOST_HINT =
  "Letters, numbers, and hyphens. Up to 63 characters per part, 253 total (e.g. www.example.com or 111.domain).";
