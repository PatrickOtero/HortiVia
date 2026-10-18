import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PrimaryButton, TextButton } from '../../../../components';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { trainingService } from '../../services/training.service';
import { ProductTrainingCard } from './index';

jest.mock('../../services/training.service', () => ({
  trainingService: { getProduct: jest.fn() },
}));
const getProduct = trainingService.getProduct as jest.Mock;
describe('ProductTrainingCard', () => {
  let renderer: Renderer.ReactTestRenderer;
  const start = jest.fn();
  afterEach(async () => {
    await act(async () => renderer.unmount());
  });
  async function render() {
    await act(async () => {
      renderer = Renderer.create(
        <ThemeProvider>
          <ProductTrainingCard productId="p1" onStart={start} />
        </ThemeProvider>,
      );
    });
  }
  it('exposes the action only when the API returns published questions', async () => {
    getProduct.mockResolvedValue({ questions: [{ id: 'q1' }] });
    await render();
    const button = renderer.root.findByType(PrimaryButton);
    expect(button.props.children).toBe('Treinar conhecimento');
    await act(async () => button.props.onPress());
    expect(start).toHaveBeenCalled();
  });
  it('hides the action for an empty product', async () => {
    getProduct.mockResolvedValue({ questions: [] });
    await render();
    expect(renderer.root.findAllByType(PrimaryButton)).toHaveLength(0);
  });
  it('offers recovery when the API is offline', async () => {
    getProduct
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ questions: [{ id: 'q1' }] });
    await render();
    await act(async () => renderer.root.findByType(TextButton).props.onPress());
    expect(renderer.root.findByType(PrimaryButton).props.children).toBe(
      'Treinar conhecimento',
    );
  });
});
