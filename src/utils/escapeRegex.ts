/**
 * Escape characters that have special meaning in a regular expression so that
 * user-supplied input can be used safely inside a MongoDB `$regex` query.
 *
 * Without this, input such as `(a+)+$` can cause catastrophic backtracking
 * (ReDoS) or alter the intended query (regex injection).
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default escapeRegex
