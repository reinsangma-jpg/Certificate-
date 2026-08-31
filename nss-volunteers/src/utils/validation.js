// Accepts examples such as UA-XX-XXX and UA-ABC-123.
export const ROLL_NO_REGEX = /^UA-[A-Za-z0-9]+-[A-Za-z0-9]+$/

export function isValidRollNo(value) {
  return ROLL_NO_REGEX.test(value.trim())
}

export function isValidPhone(value) {
  return /^[0-9+\-\s()]{7,20}$/.test(value.trim())
}
