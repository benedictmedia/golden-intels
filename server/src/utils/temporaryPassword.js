const MINIMUM_PASSWORD_LENGTH_BY_ROLE = {
  parent: 3,
  learner: 3,
  teacher: 6
}

const getMinimumTemporaryPasswordLength = (role) => MINIMUM_PASSWORD_LENGTH_BY_ROLE[role] || 6

const validateTemporaryPassword = (password, role) => {
  if (typeof password !== 'string' || !password.trim()) {
    return 'Enter a temporary password.'
  }

  if ([...password].length < getMinimumTemporaryPasswordLength(role)) {
    return `Temporary password must be at least ${getMinimumTemporaryPasswordLength(role)} characters for this account type.`
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    return 'Temporary password must be no more than 72 bytes.'
  }

  return null
}

module.exports = { getMinimumTemporaryPasswordLength, validateTemporaryPassword }
