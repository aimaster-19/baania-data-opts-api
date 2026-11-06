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

export const JWT_SECRET = required('JWT_SECRET')
export const JWT_REFRESH_SECRET = required('JWT_REFRESH_SECRET')
