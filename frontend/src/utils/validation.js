// Simple checks that mirror the backend rules (the backend still re-checks everything)
export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const MIN_NAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 6;
