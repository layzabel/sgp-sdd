import { describe, expect, it } from 'vitest';
import { emailValido } from '../../../../src/domain/email.ts';

describe('emailValido (FR-006)', () => {
  it.each(['ana@empresa.com', 'a.b@x.com.br', 'Ana@Empresa.com'])('aceita %s', (email) => {
    expect(emailValido(email)).toBe(true);
  });

  it.each([
    'ana@empresa',
    '@empresa.com',
    'ana@.com',
    'ana@empresa.',
    'ana@@empresa.com',
    'ana@x@empresa.com',
    'ana @empresa.com',
    'ana@emp resa.com',
    'anaempresa.com',
    '',
  ])('rejeita %j', (email) => {
    expect(emailValido(email)).toBe(false);
  });
});
