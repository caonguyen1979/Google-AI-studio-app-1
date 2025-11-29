export interface Question {
  id: number;
  text: string;
  num1: number;
  num2: number;
  operator: '+' | '-';
  correctAnswer: number;
  options: number[];
  visualType: 'apples' | 'stars' | 'cats' | 'cookies';
  isWordProblem: boolean;
}

export type GameState = 'intro' | 'loading' | 'playing' | 'finished' | 'error';

export interface GameStats {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}