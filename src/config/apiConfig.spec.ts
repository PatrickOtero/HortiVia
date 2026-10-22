import { resolveApiBaseUrl } from './apiConfig';

describe('resolveApiBaseUrl', () => {
  it('keeps development on the existing local API address', () => {
    expect(resolveApiBaseUrl(true, { environment: 'homolog', apiBaseUrl: 'https://stage.example.test' }))
      .toBe('http://127.0.0.1:3001');
    expect(resolveApiBaseUrl(true)).toBe('http://127.0.0.1:3001');
  });

  it('allows explicit remote development over HTTPS without using production', () => {
    expect(resolveApiBaseUrl(true, {
      environment: 'development-remote',
      apiBaseUrl: 'https://dev-api.example.test',
    })).toBe('https://dev-api.example.test');
    expect(() => resolveApiBaseUrl(true, {
      environment: 'development-remote',
      apiBaseUrl: 'http://dev-api.example.test',
    })).toThrow('valid HTTPS API URL');
    expect(() => resolveApiBaseUrl(true, {
      environment: 'development-remote',
      apiBaseUrl: 'https://p01--frutinavigator--h2j28jgg9qgs.code.run',
    })).toThrow('cannot target production');
  });

  it('keeps production on the existing API when no homologation build is selected', () => {
    expect(resolveApiBaseUrl(false, { environment: 'production', apiBaseUrl: 'https://stage.example.test' }))
      .toBe('https://p01--frutinavigator--h2j28jgg9qgs.code.run');
    expect(resolveApiBaseUrl(false)).toBe('https://p01--frutinavigator--h2j28jgg9qgs.code.run');
  });

  it('uses only HTTPS for homologation and fails closed on an unset or insecure URL', () => {
    expect(resolveApiBaseUrl(false, { environment: 'homolog', apiBaseUrl: 'https://stage.example.test/api' }))
      .toBe('https://stage.example.test/api');
    expect(() => resolveApiBaseUrl(false, { environment: 'homolog' })).toThrow('valid HTTPS API URL');
    expect(() => resolveApiBaseUrl(false, { environment: 'homolog', apiBaseUrl: 'http://stage.example.test' }))
      .toThrow('valid HTTPS API URL');
    expect(() => resolveApiBaseUrl(false, {
      environment: 'homolog',
      apiBaseUrl: 'https://p01--frutinavigator--h2j28jgg9qgs.code.run/',
    })).toThrow('cannot target production');
  });
});
