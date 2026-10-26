import { resolveApiBaseUrl } from './apiConfig';

describe('resolveApiBaseUrl', () => {
  const developmentApi =
    'https://p01--oterofficia-backend--rfp2dvf84z2n.code.run';
  const productionApi =
    'https://p01--frutinavigator--h2j28jgg9qgs.code.run';

  it('uses the centralized development API for debug builds', () => {
    expect(resolveApiBaseUrl(true)).toBe(developmentApi);
    expect(resolveApiBaseUrl(true, { environment: 'homolog' })).toBe(
      developmentApi,
    );
    expect(resolveApiBaseUrl(true, { environment: 'production' })).toBe(
      developmentApi,
    );
  });

  it('uses the homologation API when the native build identifies that variant', () => {
    expect(resolveApiBaseUrl(false, { environment: 'homolog' })).toBe(
      developmentApi,
    );
  });

  it('keeps release on the production API', () => {
    expect(resolveApiBaseUrl(false, { environment: 'production' })).toBe(
      productionApi,
    );
    expect(resolveApiBaseUrl(false)).toBe(productionApi);
    expect(resolveApiBaseUrl(false, { environment: 'unexpected' })).toBe(
      productionApi,
    );
  });
});
