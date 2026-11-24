/**
 * Query-parameter guards against NoSQL operator injection.
 *
 * With `express.urlencoded({ extended: true })` (the qs parser), a request like
 *   ?province[$regex]=(a+)+$
 * is parsed into an OBJECT: `{ $regex: '(a+)+$' }`. If that object is assigned
 * straight into a Mongo filter value, the attacker controls a query operator —
 * enabling filter bypass, data enumeration, or a server-side ReDoS that can pin
 * the database CPU. These helpers coerce such parameters to a safe primitive and
 * drop anything that is not a plain string/number, so only literal equality (or
 * our own escaped regex) can ever reach MongoDB.
 */

/**
 * Return a trimmed string only when `value` is a real string (or finite number);
 * otherwise `undefined`. Objects/arrays (operator-injection payloads) are dropped.
 */
export function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}

/**
 * True only when `value` is exactly the given string literal. Safe for
 * comparing query flags (e.g. publishStatus === 'online') without letting an
 * injected object sneak through loose truthiness checks.
 */
export function isLiteral(value: unknown, literal: string): boolean {
  return typeof value === 'string' && value === literal
}
