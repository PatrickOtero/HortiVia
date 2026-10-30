import type { PublicUserSummary } from '../../profile/types/profile';

export type TrainingProgress = {
  total: number;
  answered: number;
  correct: number;
  percent: number;
};
export type TrainingQuestion = {
  id: string;
  prompt: string;
  options: string[];
  sortOrder: number;
  version: number;
};
export type ProductTraining = {
  product: { id: string; name: string };
  questions: TrainingQuestion[];
  progress: TrainingProgress;
};
export type TrainingFeedback = {
  attemptId: number;
  questionId: string;
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
  sourceReference: string | null;
};
export type AdminTrainingQuestion = TrainingQuestion & {
  correctOptionIndex: number;
  explanation: string;
  sourceReference: string | null;
  isPublished: boolean;
  isDemo: boolean;
};
export type SaveTrainingQuestion = {
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceReference?: string;
  sortOrder: number;
  isPublished: boolean;
  version?: number;
};
export type TrainingProgressList = {
  products: {
    product: { id: string; name: string };
    progress: TrainingProgress;
  }[];
};

export type TrainingRankingEntry = {
  user: PublicUserSummary;
  progress: TrainingProgress;
  position: number;
};
export type TrainingRanking = {
  participants: number;
  top: TrainingRankingEntry[];
  currentUser: TrainingRankingEntry | null;
};
