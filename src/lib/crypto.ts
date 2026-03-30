/**
 * Hash SHA-256 tramite Web Crypto API nativa (no dipendenze esterne)
 * Usato per generare action_hash e integrity_hash
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function buildActionHash(
  sessionId: string,
  userId: string,
  action: string,
  timestamp: string,
): Promise<string> {
  return sha256(`${sessionId}|${userId}|${action}|${timestamp}`)
}

export async function buildIntegrityHash(
  participantIds: string[],
  initiatedAt: string,
): Promise<string> {
  const sorted = [...participantIds].sort().join('|')
  return sha256(`${sorted}|${initiatedAt}`)
}
