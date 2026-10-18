import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PrimaryButton, SectionTitle } from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { trainingService } from '../../services/training.service';
import { TrainingScreen } from './index';
import * as S from './styles';

jest.mock('../../services/training.service', () => ({
  trainingService: { getProduct: jest.fn(), answer: jest.fn() },
}));
const api = trainingService as jest.Mocked<typeof trainingService>;
const training = {
  product: { id: 'p1', name: 'Banana' },
  questions: [
    {
      id: 'q1',
      prompt: 'Qual orientação seguir?',
      options: ['Orientação do guia', 'Ignorar', 'Não observar'],
      version: 1,
      sortOrder: 0,
    },
    {
      id: 'q2',
      prompt: 'Como aproveitar?',
      options: ['Consultar guia', 'Ignorar guia', 'Outro'],
      version: 1,
      sortOrder: 1,
    },
  ],
  progress: { total: 2, answered: 0, correct: 0, percent: 0 },
};
const feedback = {
  attemptId: 1,
  questionId: 'q1',
  isCorrect: true,
  correctOptionIndex: 0,
  explanation: 'Explicação educativa do servidor.',
  sourceReference: 'Guia de Banana, trecho revisado.',
};

describe('TrainingScreen (real screen and controls)', () => {
  let renderer: Renderer.ReactTestRenderer;
  const goBack = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    api.getProduct.mockResolvedValue(training);
    api.answer.mockResolvedValue(feedback);
  });
  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
  });
  async function render() {
    await act(async () => {
      renderer = Renderer.create(
        <ThemeProvider>
          <TrainingScreen
            navigation={{ goBack } as never}
            route={{ params: { productId: 'p1' } } as never}
          />
        </ThemeProvider>,
      );
    });
  }
  const button = (label: string) =>
    renderer.root
      .findAllByType(PrimaryButton)
      .find(b => b.props.children === label)!;
  const titles = () =>
    renderer.root.findAllByType(SectionTitle).map(t => t.props.title);
  function visibleText(node: unknown): string {
    if (typeof node === 'string' || typeof node === 'number')
      return String(node);
    if (Array.isArray(node)) return node.map(visibleText).join('');
    if (node && typeof node === 'object' && 'children' in node)
      return visibleText(node.children);
    return '';
  }
  const text = () => visibleText(renderer.toJSON());
  async function press(label: string) {
    await act(async () => {
      await button(label).props.onPress();
    });
  }
  async function choose(index = 0) {
    await act(async () => {
      renderer.root.findAllByType(S.Option)[index].props.onPress();
    });
  }

  it('loads real product params and presents an introduction without feedback or a key', async () => {
    await render();
    expect(api.getProduct).toHaveBeenCalledWith('p1');
    expect(text()).toContain('Banana');
    expect(text()).not.toContain(feedback.explanation);
    expect(renderer.root.findAllByType(S.Option)).toHaveLength(0);
    await press('Começar treinamento');
    expect(renderer.root.findAllByType(S.Option)).toHaveLength(3);
    expect(button('Enviar resposta').props.disabled).toBe(true);
    expect(api.answer).not.toHaveBeenCalled();
  });
  it('selects an accessible radio option and sends its index and question revision', async () => {
    await render();
    await press('Começar treinamento');
    await choose(0);
    expect(
      renderer.root.findAllByType(S.Option)[0].props.accessibilityState.checked,
    ).toBe(true);
    await press('Enviar resposta');
    expect(api.answer).toHaveBeenCalledWith(
      'q1',
      expect.objectContaining({
        selectedOptionIndex: 0,
        version: 1,
        submissionKey: expect.any(String),
      }),
    );
    expect(titles()).toContain('Resposta correta!');
    expect(text()).toContain(feedback.explanation);
    expect(text()).toContain(feedback.sourceReference);
    expect(
      renderer.root.findAllByType(S.Option).every(o => o.props.disabled),
    ).toBe(true);
  });
  it('shows educational feedback for an incorrect answer', async () => {
    api.answer.mockResolvedValue({ ...feedback, isCorrect: false });
    await render();
    await press('Começar treinamento');
    await choose(1);
    await press('Enviar resposta');
    expect(titles()).toContain('Vamos aprender com essa resposta');
    expect(text()).toContain('Orientação do guia');
  });
  it('prevents two submissions in the same frame and during a pending request', async () => {
    let resolve!: (value: typeof feedback) => void;
    api.answer.mockImplementation(
      () =>
        new Promise(r => {
          resolve = r;
        }),
    );
    await render();
    await press('Começar treinamento');
    await choose();
    const send = button('Enviar resposta').props.onPress;
    await act(async () => {
      send();
      send();
    });
    expect(api.answer).toHaveBeenCalledTimes(1);
    expect(button('Enviar resposta').props.loading).toBe(true);
    await act(async () => {
      resolve(feedback);
    });
    await act(async () => {
      send();
    });
    expect(api.answer).toHaveBeenCalledTimes(1);
  });
  it('retries a lost response with the same submission key', async () => {
    api.answer
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(feedback);
    await render();
    await press('Começar treinamento');
    await choose();
    await press('Enviar resposta');
    expect(text()).toContain('Confira a conexão');
    await press('Enviar resposta');
    expect(api.answer.mock.calls[0][1]).toEqual(api.answer.mock.calls[1][1]);
    expect(titles()).toContain('Resposta correta!');
  });
  it('completes a round, reads server progress and allows repeating', async () => {
    await render();
    await press('Começar treinamento');
    await choose();
    await press('Enviar resposta');
    await press('Próxima pergunta');
    expect(titles()).toContain('Pergunta 2 de 2');
    api.answer.mockResolvedValue({
      ...feedback,
      questionId: 'q2',
      isCorrect: false,
    });
    await choose(1);
    await press('Enviar resposta');
    api.getProduct.mockResolvedValue({
      ...training,
      progress: { total: 2, answered: 2, correct: 1, percent: 50 },
    });
    await press('Ver resultado');
    expect(titles()).toContain('Treinamento concluído');
    expect(text()).toContain('50%');
    expect(api.getProduct).toHaveBeenCalledTimes(2);
    await press('Repetir treinamento');
    await press('Começar treinamento');
    expect(titles()).toContain('Pergunta 1 de 2');
    await choose();
    await press('Enviar resposta');
    expect(api.answer.mock.calls[0][1].submissionKey).not.toBe(
      api.answer.mock.calls[2][1].submissionKey,
    );
  });
  it('shows an empty state when there are no published questions', async () => {
    api.getProduct.mockResolvedValue({ ...training, questions: [] });
    await render();
    expect(titles()).toContain('Ainda não há perguntas publicadas.');
    expect(renderer.root.findAllByType(PrimaryButton)).toHaveLength(0);
  });
  it('preserves the local round while progress is pending or fails, and retries only the query', async () => {
    await render();
    await press('Começar treinamento');
    await choose();
    await press('Enviar resposta');
    await press('Próxima pergunta');
    api.answer.mockResolvedValue({
      ...feedback,
      questionId: 'q2',
      isCorrect: false,
    });
    await choose(1);
    await press('Enviar resposta');
    let reject!: (error: Error) => void;
    api.getProduct.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    await press('Ver resultado');
    expect(text()).toContain('Nesta rodada: 1 de 2 acertos.');
    expect(text()).not.toContain('Progresso atual:');
    await act(async () => {
      reject(new Error('offline'));
    });
    expect(titles()).toContain('Treinamento concluído');
    expect(text()).toContain('Nesta rodada: 1 de 2 acertos.');
    expect(text()).toContain('Não foi possível atualizar seu progresso.');
    expect(text()).not.toContain('Progresso atual:');
    api.getProduct.mockResolvedValue({
      ...training,
      progress: { total: 2, answered: 2, correct: 1, percent: 50 },
    });
    await press('Atualizar progresso');
    expect(text()).toContain('Nesta rodada: 1 de 2 acertos.');
    expect(text()).toContain('Progresso atual: 1/2 corretas (50%).');
    expect(api.answer).toHaveBeenCalledTimes(2);
    expect(api.getProduct).toHaveBeenCalledTimes(3);
  });
  it('recovers from a load failure without substituting mock questions', async () => {
    api.getProduct
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(training);
    await render();
    expect(titles()).toContain('Não foi possível carregar o treinamento.');
    expect(renderer.root.findAllByType(S.Option)).toHaveLength(0);
    await press('Tentar novamente');
    expect(text()).toContain('Banana');
  });
  it.each([404, 409])(
    'explains an unavailable or revised question (%s)',
    async status => {
      api.answer.mockRejectedValue({ response: { status } });
      await render();
      await press('Começar treinamento');
      await choose();
      await press('Enviar resposta');
      expect(text()).toContain('Volte e abra novamente');
      expect(titles()).not.toContain('Resposta correta!');
    },
  );
});
