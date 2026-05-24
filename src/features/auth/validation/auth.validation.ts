const EMAIL_MAX_LENGTH = 254;
const NAME_MAX_LENGTH = 80;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 72;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const NUMBER_PATTERN = /[0-9]/;
const LINE_BREAK_PATTERN = /[\r\n]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONFIRMATION_CODE_PATTERN = /^\d{6}$/;
const SPECIAL_CHARACTERS = new Set([
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '_',
  '+',
  '-',
  '=',
  '[',
  ']',
  '{',
  '}',
  ';',
  "'",
  ':',
  '"',
  '\\',
  '|',
  ',',
  '.',
  '<',
  '>',
  '/',
  '?',
  '`',
  '~',
]);

export type PasswordRules = {
  hasValidLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
  hasTrimmedEdges: boolean;
  hasNoLineBreaks: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || normalizedEmail.length > EMAIL_MAX_LENGTH) {
    return 'Informe um e-mail válido.';
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Informe um e-mail válido.';
  }

  return null;
}

export function validateName(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return 'Informe seu nome.';
  }

  if (trimmedName.length < 2) {
    return 'O nome deve ter pelo menos 2 caracteres.';
  }

  if (trimmedName.length > NAME_MAX_LENGTH) {
    return 'O nome deve ter no máximo 80 caracteres.';
  }

  return null;
}

export function getPasswordRules(password: string): PasswordRules {
  return {
    hasValidLength:
      password.length >= PASSWORD_MIN_LENGTH &&
      password.length <= PASSWORD_MAX_LENGTH,
    hasUppercase: UPPERCASE_PATTERN.test(password),
    hasLowercase: LOWERCASE_PATTERN.test(password),
    hasNumber: NUMBER_PATTERN.test(password),
    hasSpecialCharacter: [...password].some(character =>
      SPECIAL_CHARACTERS.has(character),
    ),
    hasTrimmedEdges: password === password.trim(),
    hasNoLineBreaks: !LINE_BREAK_PATTERN.test(password),
  };
}

export function validatePassword(password: string) {
  const rules = getPasswordRules(password);

  if (!rules.hasTrimmedEdges) {
    return 'A senha não pode começar ou terminar com espaços.';
  }

  if (!rules.hasNoLineBreaks) {
    return 'A senha não pode conter quebra de linha.';
  }

  if (!rules.hasValidLength) {
    return 'A senha deve ter entre 10 e 72 caracteres.';
  }

  if (
    !rules.hasUppercase ||
    !rules.hasLowercase ||
    !rules.hasNumber ||
    !rules.hasSpecialCharacter
  ) {
    return 'A senha deve incluir letra maiúscula, letra minúscula, número e caractere especial.';
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
) {
  if (!confirmPassword || password !== confirmPassword) {
    return 'As senhas não conferem.';
  }

  return null;
}

export function normalizeConfirmationCode(code: string) {
  return code.replace(/\D/g, '').slice(0, 6);
}

export function validateConfirmationCode(code: string) {
  const normalizedCode = normalizeConfirmationCode(code);

  if (!normalizedCode) {
    return 'Informe o código.';
  }

  if (!CONFIRMATION_CODE_PATTERN.test(normalizedCode)) {
    return 'O código deve ter 6 dígitos.';
  }

  return null;
}

export function validatePasswordResetCode(code: string) {
  const normalizedCode = normalizeConfirmationCode(code);

  if (!normalizedCode) {
    return 'Informe o código.';
  }

  if (!CONFIRMATION_CODE_PATTERN.test(normalizedCode)) {
    return 'O código deve ter 6 dígitos.';
  }

  return null;
}
