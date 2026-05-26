import {
  getProductGuideSectionKindValueLabel,
  getProductImageKindLabel,
  parseSortOrder,
  toCreateProductGuideSectionPayload,
  toUpdateProductImagePayload,
  validateProductGuideSectionForm,
  validateProductImageForm,
} from './adminVisualContent';

describe('adminVisualContent', () => {
  it('maps product image kind labels to Portuguese', () => {
    expect(getProductImageKindLabel('DEFECT')).toBe('Sinais de atenção');
    expect(getProductImageKindLabel('WHOLE')).toBe('Produto inteiro');
  });

  it('maps guide section kind labels to Portuguese', () => {
    expect(getProductGuideSectionKindValueLabel('CHOOSE')).toBe(
      'Como escolher',
    );
    expect(getProductGuideSectionKindValueLabel('QUICK_FACTS')).toBe(
      'Informações rápidas',
    );
  });

  it('converts multiline section fields into arrays', () => {
    const payload = toCreateProductGuideSectionPayload({
      kind: 'STORE',
      title: 'Como conservar',
      body: 'Guarde corretamente.',
      imageAlt: '',
      imageCaption: '',
      bullets: 'Geladeira\nPote fechado',
      idealPoints: 'Seco\nBem protegido',
      avoidPoints: 'Umidade\nCalor excessivo',
      sortOrder: '2',
    });

    expect(payload).toEqual({
      kind: 'STORE',
      title: 'Como conservar',
      body: 'Guarde corretamente.',
      imageAlt: null,
      imageCaption: null,
      bullets: ['Geladeira', 'Pote fechado'],
      idealPoints: ['Seco', 'Bem protegido'],
      avoidPoints: ['Umidade', 'Calor excessivo'],
      sortOrder: 2,
    });
  });

  it('accepts pasted JSON arrays in section fields', () => {
    const payload = toCreateProductGuideSectionPayload({
      kind: 'USE',
      title: 'Como usar',
      body: 'Use no dia a dia.',
      imageAlt: '',
      imageCaption: '',
      bullets: '["Use em vitaminas","Sirva em torradas"]',
      idealPoints: '["Polpa cremosa","Boa textura"]',
      avoidPoints: '["Polpa muito escurecida","Excesso de ingredientes"]',
      sortOrder: '3',
    });

    expect(payload.bullets).toEqual(['Use em vitaminas', 'Sirva em torradas']);
    expect(payload.idealPoints).toEqual(['Polpa cremosa', 'Boa textura']);
    expect(payload.avoidPoints).toEqual([
      'Polpa muito escurecida',
      'Excesso de ingredientes',
    ]);
  });

  it('accepts comma separated values in section fields', () => {
    const payload = toCreateProductGuideSectionPayload({
      kind: 'OBSERVE',
      title: 'O que observar',
      body: 'Veja os sinais principais.',
      imageAlt: '',
      imageCaption: '',
      bullets: 'Casca íntegra, Leve maciez ao toque, Polpa uniforme',
      idealPoints: 'Cheiro suave, Sem rachaduras',
      avoidPoints: 'Áreas afundadas, Cheiro fermentado',
      sortOrder: '1',
    });

    expect(payload.bullets).toEqual([
      'Casca íntegra',
      'Leve maciez ao toque',
      'Polpa uniforme',
    ]);
    expect(payload.idealPoints).toEqual(['Cheiro suave', 'Sem rachaduras']);
    expect(payload.avoidPoints).toEqual([
      'Áreas afundadas',
      'Cheiro fermentado',
    ]);
  });

  it('handles empty multiline fields safely', () => {
    const payload = toCreateProductGuideSectionPayload({
      kind: 'OTHER',
      title: 'Observações',
      body: 'Texto curto.',
      imageAlt: '',
      imageCaption: '',
      bullets: '',
      idealPoints: '',
      avoidPoints: '',
      sortOrder: '',
    });

    expect(payload.bullets).toEqual([]);
    expect(payload.idealPoints).toEqual([]);
    expect(payload.avoidPoints).toEqual([]);
    expect(payload.sortOrder).toBeUndefined();
  });

  it('builds update image payload without forcing an empty url', () => {
    const payload = toUpdateProductImagePayload({
      kind: 'USAGE',
      alt: ' Produto preparado ',
      caption: ' Nova legenda ',
      sortOrder: '1',
      isPrimary: false,
    });

    expect(payload).toEqual({
      kind: 'USAGE',
      alt: 'Produto preparado',
      caption: 'Nova legenda',
      sortOrder: 1,
      isPrimary: false,
    });
    expect(payload).not.toHaveProperty('url');
  });

  it('validates required product image form fields', () => {
    expect(
      validateProductImageForm({
        kind: null,
        alt: '',
        caption: '',
        sortOrder: 'abc',
        isPrimary: false,
      }),
    ).toEqual({
      kind: 'Selecione um tipo de imagem.',
      sortOrder: 'Informe uma ordem válida.',
    });
  });

  it('validates required guide section form fields', () => {
    expect(
      validateProductGuideSectionForm({
        kind: null,
        title: '',
        body: '',
        imageAlt: '',
        imageCaption: '',
        bullets: '',
        idealPoints: '',
        avoidPoints: '',
        sortOrder: '-1',
      }),
    ).toEqual({
      kind: 'Selecione um tipo de seção.',
      title: 'Informe o título.',
      body: 'Informe o texto principal.',
      sortOrder: 'Informe uma ordem válida.',
    });
  });

  it('parses sortOrder only when it is a valid non-negative integer', () => {
    expect(parseSortOrder('3')).toBe(3);
    expect(parseSortOrder('')).toBeUndefined();
    expect(parseSortOrder('-1')).toBeNull();
  });
});
