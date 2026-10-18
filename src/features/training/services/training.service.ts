import { API_ENDPOINTS } from '../../../config/apiConfig';
import { apiClient } from '../../../services/api/apiClient';
import type {
  AdminTrainingQuestion,
  ProductTraining,
  SaveTrainingQuestion,
  TrainingFeedback,
  TrainingProgressList,
} from '../types/training';

export const trainingService = {
  async getProduct(productId: string): Promise<ProductTraining> {
    return (await apiClient.get(API_ENDPOINTS.training.product(productId)))
      .data;
  },
  async answer(
    questionId: string,
    payload: {
      selectedOptionIndex: number;
      version: number;
      submissionKey: string;
    },
  ): Promise<TrainingFeedback> {
    return (
      await apiClient.post(API_ENDPOINTS.training.answer(questionId), payload)
    ).data;
  },
  async progress(): Promise<TrainingProgressList> {
    return (await apiClient.get(API_ENDPOINTS.training.progress)).data;
  },
  async adminList(productId: string): Promise<{
    product: { id: string; name: string };
    questions: AdminTrainingQuestion[];
  }> {
    return (
      await apiClient.get(API_ENDPOINTS.training.adminQuestions(productId))
    ).data;
  },
  async save(
    productId: string,
    payload: SaveTrainingQuestion,
    questionId?: string,
  ): Promise<AdminTrainingQuestion> {
    return questionId
      ? (
          await apiClient.patch(
            API_ENDPOINTS.training.adminQuestion(productId, questionId),
            payload,
          )
        ).data
      : (
          await apiClient.post(
            API_ENDPOINTS.training.adminQuestions(productId),
            payload,
          )
        ).data;
  },
};
