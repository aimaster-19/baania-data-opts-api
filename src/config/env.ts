/**
 * Centralized, validated access to required environment variables.
 *
 * Reading secrets through this module (instead of `process.env.X || 'fallback'`)
 * guarantees the app fails fast at startup when a secret is missing, rather than
 * silently signing/verifying tokens with a hard-coded, guessable fallback.
 *
 * dotenv is loaded in server.ts before app (and therefore this module) is
 * imported, so the values are available by the time these run.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Known placeholder/default values that ship in the committed example config.
 * If any of these ever reach a running server they let an attacker forge a
 * valid JWT and impersonate any user, so they are hard-rejected in production.
 */
const WEAK_SECRETS = new Set([
  'super_secret_key_change_in_production',
  'super_secret_refresh_key_change_in_production',
  'secret',
  'changeme',
  'change_in_production'
])

/** Minimum entropy we require of a signing secret (characters). */
const MIN_SECRET_LENGTH = 32

/**
 * Read a signing secret and reject weak/default values.
 *
 * In production a weak or too-short secret is a fatal startup error (fail fast).
 * Outside production it is downgraded to a loud warning so local development is
 * not blocked, but the risk is still visible.
 */
function secret(name: string): string {
  const value = required(name)
  const isProd = process.env.NODE_ENV === 'production'
  const isWeak = WEAK_SECRETS.has(value) || value.length < MIN_SECRET_LENGTH

  if (isWeak) {
    const reason = WEAK_SECRETS.has(value)
      ? `${name} is set to a known default/placeholder value`
      : `${name} is shorter than ${MIN_SECRET_LENGTH} characters`
    const message =
      `Insecure secret: ${reason}. ` +
      `Generate a strong random value, e.g. \`openssl rand -hex 32\`, and set it in your environment.`

    if (isProd) {
      // Never let a production server boot with a forgeable signing key.
      throw new Error(message)
    }
    // eslint-disable-next-line no-console
    console.warn(`⚠️  [env] ${message}`)
  }

  return value
}

export const JWT_SECRET = secret('JWT_SECRET')
export const JWT_REFRESH_SECRET = secret('JWT_REFRESH_SECRET')
