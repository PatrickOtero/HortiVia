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
    return 'Informe um e-mail v\u00e1lido.';
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return 'Informe um e-mail v\u00e1lido.';
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
    return 'O nome deve ter no m\u00e1ximo 80 caracteres.';
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
    return 'A senha n\u00e3o pode come\u00e7ar ou terminar com espa\u00e7os.';
  }

  if (!rules.hasNoLineBreaks) {
    return 'A senha n\u00e3o pode conter quebra de linha.';
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
    return 'A senha deve incluir letra mai\u00fascula, letra min\u00fascula, n\u00famero e caractere especial.';
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
) {
  if (!confirmPassword || password !== confirmPassword) {
    return 'As senhas n\u00e3o conferem.';
  }

  return null;
}

export function normalizeConfirmationCode(code: string) {
  return code.replace(/\D/g, '').slice(0, 6);
}

export function validateConfirmationCode(code: string) {
  const normalizedCode = normalizeConfirmationCode(code);

  if (!normalizedCode) {
    return 'Informe o c\u00f3digo de confirma\u00e7\u00e3o.';
  }

  if (!CONFIRMATION_CODE_PATTERN.test(normalizedCode)) {
    return 'O c\u00f3digo deve ter 6 d\u00edgitos.';
  }

  return null;
}
