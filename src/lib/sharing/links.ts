/**
 * Placeholder for shareable group invite links.
 * Wire up token generation + /join/[token] route when ready.
 */
export function getGroupShareUrl(groupId: string): string {
  if (typeof window === "undefined") {
    return `/groups/${groupId}`;
  }
  return `${window.location.origin}/groups/${groupId}`;
}
