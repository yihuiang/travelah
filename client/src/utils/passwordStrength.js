export function getPasswordStrength(password) {
  if (!password) {
    return { percent: 0, label: '', isStrongEnough: false }
  }

  const checks = {
    length8: password.length >= 8,
    length12: password.length >= 12,
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  }

  const passed = Object.values(checks).filter(Boolean).length
  const percent = Math.min(100, Math.round((passed / 5) * 100) + (password.length < 8 ? 0 : 8))

  let label = 'BASIC'
  if (passed >= 5) label = 'SOPHISTICATED'
  else if (passed >= 4) label = 'REFINED'
  else if (passed >= 3) label = 'BALANCED'
  else if (passed >= 2) label = 'BASIC'

  const isStrongEnough =
    checks.length8 && (checks.mixedCase || checks.number) && (checks.number || checks.symbol)

  return { percent: Math.max(percent, 12), label, isStrongEnough }
}
