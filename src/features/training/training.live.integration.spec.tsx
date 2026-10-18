/// <reference types="node" />
import React from 'react';
import fs from 'fs';
import path from 'path';
import type { AxiosStatic } from 'axios';
import Renderer, { act } from 'react-test-renderer';
import { PrimaryButton, SectionTitle } from '../../components';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { apiClient, setApiAccessToken } from '../../services/api/apiClient';
import { trainingService } from './services/training.service';
import { TrainingScreen } from './screens/TrainingScreen';
import * as S from './screens/TrainingScreen/styles';

// Opt-in to the isolated Nest/PostgreSQL fixture; all HTTP and grading are real.
const fixturePath = process.env.TRAINING_DEMO_FIXTURE_FILE;
const live = fixturePath ? describe : describe.skip;
live('Quick training: mobile screen -> Axios -> Nest -> PostgreSQL', () => {
  it('publishes reviewed drafts, completes and repeats training, and reads persisted progress', async () => {
    const fixture = JSON.parse(fs.readFileSync(fixturePath!, 'utf8')) as {
      baseURL: string;
      productId: string;
      userToken: string;
      adminToken: string;
    };
    if (fixture.baseURL !== 'http://127.0.0.1:3109')
      throw new Error('Live test only permits the isolated loopback API.');
    const defaults = {
      baseURL: apiClient.defaults.baseURL,
      adapter: apiClient.defaults.adapter,
    };
    apiClient.defaults.baseURL = fixture.baseURL;
    // The RN Jest preset resolves Axios' browser export. Use its real Node HTTP
    // adapter for sockets in this test process; the app's transport is unchanged.
    const nodeAxios = jest.requireActual(
      path.join(
        path.dirname(require.resolve('axios/package.json')),
        'dist/node/axios.cjs',
      ),
    ) as AxiosStatic;
    apiClient.defaults.adapter = nodeAxios.getAdapter('http');
    let renderer: Renderer.ReactTestRenderer | undefined;
    try {
      setApiAccessToken(fixture.adminToken);
      const drafts = await trainingService.adminList(fixture.productId);
      expect(drafts.questions).toHaveLength(3);
      for (const q of drafts.questions) {
        await trainingService.save(
          fixture.productId,
          {
            prompt: q.prompt,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation,
            sourceReference: q.sourceReference ?? '',
            sortOrder: q.sortOrder,
            isPublished: true,
            version: q.version,
          },
          q.id,
        );
      }
      setApiAccessToken(fixture.userToken);
      const published = await trainingService.getProduct(fixture.productId);
      expect(published.questions).toHaveLength(3);
      expect(JSON.stringify(published.questions)).not.toContain(
        'correctOptionIndex',
      );
      await act(async () => {
        renderer = Renderer.create(
          <ThemeProvider>
            <TrainingScreen
              navigation={{ goBack: jest.fn() } as never}
              route={{ params: { productId: fixture.productId } } as never}
            />
          </ThemeProvider>,
        );
      });
      // React act does not await real socket I/O; poll with a bounded deadline.
      async function until(check: () => boolean) {
        const deadline = Date.now() + 10000;
        while (!check()) {
          if (Date.now() > deadline)
            throw new Error('Timed out waiting for the real training API');
          await act(async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 30));
          });
        }
      }
      const button = (label: string) =>
        renderer!.root
          .findAllByType(PrimaryButton)
          .find(b => b.props.children === label);
      async function press(label: string) {
        await until(() => !!button(label));
        await act(async () => {
          button(label)!.props.onPress();
        });
      }
      await press('Começar treinamento');
      for (let i = 0; i < drafts.questions.length; i += 1) {
        const q = drafts.questions[i];
        const choice =
          i === 1
            ? (q.correctOptionIndex + 1) % q.options.length
            : q.correctOptionIndex;
        await act(async () => {
          renderer!.root.findAllByType(S.Option)[choice].props.onPress();
        });
        await press('Enviar resposta');
        await press(i === 2 ? 'Ver resultado' : 'Próxima pergunta');
      }
      await until(() =>
        renderer!.root
          .findAllByType(SectionTitle)
          .some(t => t.props.title === 'Treinamento concluído'),
      );
      // The local result is visible before the final progress request settles.
      // Await that request inside act before reading the confirmed server result.
      await until(() =>
        renderer!.root
          .findAllByType(S.Copy)
          .some(copy =>
            React.Children.toArray(copy.props.children)
              .join('')
              .includes('Progresso atual: 2/3 corretas (67%).'),
          ),
      );
      const firstRound = (await trainingService.getProduct(fixture.productId))
        .progress;
      expect(firstRound).toMatchObject({
        total: 3,
        answered: 3,
        correct: 2,
        percent: 67,
      });
      fs.writeFileSync(
        path.join(path.dirname(fixturePath!), 'live-training-result.json'),
        JSON.stringify(renderer!.toJSON(), null, 2),
      );
      await press('Repetir treinamento');
      await press('Começar treinamento');
      const wrong =
        (drafts.questions[0].correctOptionIndex + 1) %
        drafts.questions[0].options.length;
      await act(async () => {
        renderer!.root.findAllByType(S.Option)[wrong].props.onPress();
      });
      await press('Enviar resposta');
      await until(() => !!button('Próxima pergunta'));
      const repeated = (await trainingService.getProduct(fixture.productId))
        .progress;
      expect(repeated.correct).toBe(1);
      expect(
        (await trainingService.progress()).products.find(
          p => p.product.id === fixture.productId,
        )?.progress.correct,
      ).toBe(1);
      fs.writeFileSync(
        path.join(path.dirname(fixturePath!), 'live-flow.json'),
        JSON.stringify(
          {
            transport:
              'React Native screen + real Axios Node HTTP adapter in Jest + Nest JWT guards + PostgreSQL',
            product: published.product,
            questionsPublished: published.questions.length,
            firstRound,
            afterRepeatingFirstQuestionWithWrongAnswer: repeated,
          },
          null,
          2,
        ),
      );
    } finally {
      if (renderer) await act(async () => renderer!.unmount());
      setApiAccessToken(null);
      Object.assign(apiClient.defaults, defaults);
    }
  }, 60000);
});
