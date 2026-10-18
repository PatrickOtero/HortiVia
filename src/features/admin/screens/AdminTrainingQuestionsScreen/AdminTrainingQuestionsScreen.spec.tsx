import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Switch } from 'react-native';
import { InputField, PrimaryButton, TextButton } from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { trainingService } from '../../../training/services/training.service';
import { AdminTrainingQuestionsScreen } from './index';
jest.mock('../../../auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('../../../training/services/training.service', () => ({
  trainingService: { adminList: jest.fn(), save: jest.fn() },
}));
const api = trainingService as jest.Mocked<typeof trainingService>;
const auth = useAuth as jest.Mock;
const existing = {
  id: 'q1',
  prompt: 'Como escolher?',
  options: ['Firme', 'Amassado', 'Ignorar'],
  correctOptionIndex: 0,
  explanation: 'Consultar o guia.',
  sourceReference: 'Guia',
  sortOrder: 0,
  version: 1,
  isPublished: false,
  isDemo: true,
};
describe('AdminTrainingQuestionsScreen', () => {
  let renderer: Renderer.ReactTestRenderer;
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockReturnValue({ user: { role: 'ADMIN' } });
    api.adminList.mockResolvedValue({
      product: { id: 'p1', name: 'Banana' },
      questions: [existing],
    });
    api.save.mockResolvedValue({
      ...existing,
      isPublished: true,
      isDemo: false,
    });
  });
  afterEach(async () => {
    await act(async () => renderer.unmount());
  });
  async function render() {
    await act(async () => {
      renderer = Renderer.create(
        <ThemeProvider>
          <AdminTrainingQuestionsScreen
            navigation={{ goBack: jest.fn() } as never}
            route={{ params: { productId: 'p1' } } as never}
          />
        </ThemeProvider>,
      );
    });
  }
  async function press(label: string) {
    const b = [
      ...renderer.root.findAllByType(PrimaryButton),
      ...renderer.root.findAllByType(TextButton),
    ].find(n => n.props.children === label)!;
    await act(async () => {
      await b.props.onPress();
    });
  }
  async function changeField(label: string, value: string) {
    const field = renderer.root
      .findAllByType(InputField)
      .find(input => input.props.label === label)!;
    await act(async () => {
      field.props.onChangeText(value);
    });
  }
  async function fillNewQuestion() {
    await press('Nova pergunta');
    await changeField('Enunciado', existing.prompt);
    for (let i = 0; i < existing.options.length; i += 1)
      await changeField(`Alternativa ${i + 1}`, existing.options[i]);
    await changeField('Explicação educativa', existing.explanation);
  }
  it('blocks common users without issuing an administrative request', async () => {
    auth.mockReturnValue({ user: { role: 'USER' } });
    await render();
    expect(api.adminList).not.toHaveBeenCalled();
    expect(api.save).not.toHaveBeenCalled();
  });
  it('requires fields before creating a question', async () => {
    await render();
    await press('Nova pergunta');
    await press('Salvar pergunta');
    expect(api.save).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain('Preencha o enunciado');
  });
  it('edits a complete question and explicitly publishes after review', async () => {
    await render();
    await press('Editar pergunta');
    await act(async () =>
      renderer.root.findByType(Switch).props.onValueChange(true),
    );
    await press('Salvar pergunta');
    expect(api.save).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        options: existing.options,
        version: 1,
        isPublished: true,
        correctOptionIndex: 0,
      }),
      'q1',
    );
    expect(JSON.stringify(renderer.toJSON())).toContain(
      'Pergunta salva e publicada.',
    );
  });
  it('rejects duplicate alternatives in the editor', async () => {
    await render();
    await press('Editar pergunta');
    const second = renderer.root
      .findAllByType(InputField)
      .find(n => n.props.label === 'Alternativa 2')!;
    await act(async () => second.props.onChangeText(' firme '));
    await press('Salvar pergunta');
    expect(api.save).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain(
      'As alternativas devem ser diferentes.',
    );
  });
  it('keeps the form when a save fails, instead of reporting success', async () => {
    api.save.mockRejectedValue(new Error('offline'));
    await render();
    await press('Editar pergunta');
    await press('Salvar pergunta');
    expect(JSON.stringify(renderer.toJSON())).toContain(
      'Não foi possível salvar.',
    );
    expect(renderer.root.findAllByType(InputField).length).toBeGreaterThan(0);
  });
  it.each(['create', 'edit'])(
    'rejects publication without a nonempty source when attempting to %s',
    async mode => {
      await render();
      if (mode === 'create') await fillNewQuestion();
      else await press('Editar pergunta');
      await changeField('Referência no guia', ' \n\t ');
      await act(async () => {
        renderer.root.findByType(Switch).props.onValueChange(true);
      });
      await press('Salvar pergunta');
      expect(api.save).not.toHaveBeenCalled();
      expect(JSON.stringify(renderer.toJSON())).toContain(
        'Informe uma referência no guia para publicar a pergunta.',
      );
    },
  );
  it('creates a published question with a trimmed reference', async () => {
    await render();
    await fillNewQuestion();
    await changeField('Referência no guia', '  Banana — Como escolher  ');
    await act(async () => {
      renderer.root.findByType(Switch).props.onValueChange(true);
    });
    await press('Salvar pergunta');
    expect(api.save).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({
        sourceReference: 'Banana — Como escolher',
        isPublished: true,
      }),
      undefined,
    );
  });
  it.each(['create', 'edit'])(
    'allows a draft with an empty reference when attempting to %s',
    async mode => {
      await render();
      if (mode === 'create') await fillNewQuestion();
      else await press('Editar pergunta');
      await changeField('Referência no guia', '   ');
      await press('Salvar pergunta');
      expect(api.save).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ sourceReference: '', isPublished: false }),
        mode === 'edit' ? 'q1' : undefined,
      );
    },
  );
});
