/**
 * Esegue una funzione asincrona con retry automatico in caso di errore.
 * Usa un backoff lineare: delayMs * (tentativo + 1).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, delayMs = 500 }: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }
  throw lastError
}
