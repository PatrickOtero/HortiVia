import {
  getPasswordRules,
  normalizeConfirmationCode,
  normalizeEmail,
  validateConfirmationCode,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from './auth.validation';

describe('auth.validation', () => {
  it('normalizeEmail trims and lowercases', () => {
    expect(normalizeEmail('  Patrick@Email.com  ')).toBe('patrick@email.com');
  });

  it('rejects an invalid e-mail', () => {
    expect(validateEmail('invalid-email')).toBe('Informe um e-mail v\u00e1lido.');
  });

  it('accepts a valid e-mail', () => {
    expect(validateEmail('patrick@email.com')).toBeNull();
  });

  it('rejects a password without uppercase', () => {
    expect(validatePassword('senhaforte@123')).toBe(
      'A senha deve incluir letra mai\u00fascula, letra min\u00fascula, n\u00famero e caractere especial.',
    );
  });

  it('rejects a password without lowercase', () => {
    expect(validatePassword('SENHAFORTE@123')).toBe(
      'A senha deve incluir letra mai\u00fascula, letra min\u00fascula, n\u00famero e caractere especial.',
    );
  });

  it('rejects a password without number', () => {
    expect(validatePassword('SenhaForte@abc')).toBe(
      'A senha deve incluir letra mai\u00fascula, letra min\u00fascula, n\u00famero e caractere especial.',
    );
  });

  it('rejects a password without special character', () => {
    expect(validatePassword('SenhaForte123')).toBe(
      'A senha deve incluir letra mai\u00fascula, letra min\u00fascula, n\u00famero e caractere especial.',
    );
  });

  it('rejects a password shorter than 10 characters', () => {
    expect(validatePassword('S@1enha')).toBe(
      'A senha deve ter entre 10 e 72 caracteres.',
    );
  });

  it('rejects a password longer than 72 characters', () => {
    expect(validatePassword(`${'SenhaForte@123'.repeat(6)}Senha`)).toBe(
      'A senha deve ter entre 10 e 72 caracteres.',
    );
  });

  it('rejects a password with leading or trailing spaces', () => {
    expect(validatePassword(' SenhaForte@123 ')).toBe(
      'A senha n\u00e3o pode come\u00e7ar ou terminar com espa\u00e7os.',
    );
  });

  it('rejects a password with line break', () => {
    expect(validatePassword('Senha\nForte@123')).toBe(
      'A senha n\u00e3o pode conter quebra de linha.',
    );
  });

  it('accepts a valid strong password', () => {
    expect(validatePassword('SenhaForte@123')).toBeNull();
  });

  it('rejects confirm password mismatch', () => {
    expect(validateConfirmPassword('SenhaForte@123', 'SenhaForte@124')).toBe(
      'As senhas n\u00e3o conferem.',
    );
  });

  it('normalizes confirmation code to digits only', () => {
    expect(normalizeConfirmationCode('12a-34 56')).toBe('123456');
  });

  it('rejects confirmation code shorter than 6 digits', () => {
    expect(validateConfirmationCode('12345')).toBe(
      'O c\u00f3digo deve ter 6 d\u00edgitos.',
    );
  });

  it('rejects confirmation code with letters', () => {
    expect(validateConfirmationCode('12a456')).toBe(
      'O c\u00f3digo deve ter 6 d\u00edgitos.',
    );
  });

  it('accepts a valid 6-digit confirmation code', () => {
    expect(validateConfirmationCode('123456')).toBeNull();
  });

  it('returns the expected password rules', () => {
    expect(getPasswordRules('SenhaForte@123')).toEqual({
      hasValidLength: true,
      hasUppercase: true,
      hasLowercase: true,
      hasNumber: true,
      hasSpecialCharacter: true,
      hasTrimmedEdges: true,
      hasNoLineBreaks: true,
    });
  });
});
