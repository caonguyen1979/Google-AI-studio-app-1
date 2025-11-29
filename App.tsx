import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Question } from './types';
import { generateQuestions } from './services/gemini';
import { playSuccessSound, playErrorSound, playWinMusic } from './services/audio';
import QuizCard from './components/QuizCard';
import { Calculator, Trophy, Play, RotateCcw, Star, Music } from 'lucide-react';

const QUESTION_COUNT = 30;

function App() {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  // Initialize game
  const startGame = useCallback(async () => {
    setGameState('loading');
    setScore(0);
    setCurrentIndex(0);
    setLastAnswerCorrect(null);
    
    try {
      const qs = await generateQuestions(QUESTION_COUNT);
      setQuestions(qs);
      setGameState('playing');
    } catch (e) {
      console.error(e);
      // Fallback handled in service, but double check
      setGameState('error');
    }
  }, []);

  const handleAnswer = (answer: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const currentQ = questions[currentIndex];
    const isCorrect = answer === currentQ.correctAnswer;

    // Small delay to let the user see the button selection feedback before the result overlay and sound
    setTimeout(() => {
      setLastAnswerCorrect(isCorrect);

      if (isCorrect) {
        playSuccessSound();
        setScore(prev => prev + 1);
      } else {
        playErrorSound();
      }
    }, 300);

    // Delay before next question
    setTimeout(() => {
      setLastAnswerCorrect(null);
      setIsProcessing(false);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishGame();
      }
    }, 1800); // 300ms + 1500ms delay
  };

  const finishGame = () => {
    setGameState('finished');
    playWinMusic();
  };

  // Intro Screen
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-yellow-300"></div>
          
          <div className="mb-8 relative">
            <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto flex items-center justify-center float-anim">
              <Calculator className="w-16 h-16 text-blue-500" />
            </div>
            <Star className="absolute top-0 right-10 text-yellow-400 w-8 h-8 animate-bounce" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
            Bé Vui Học Toán
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Cùng làm {QUESTION_COUNT} phép tính cộng trừ trong phạm vi 10 nhé!
          </p>

          <button 
            onClick={startGame}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-2xl font-bold shadow-[0_4px_0_0_#15803d] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-8 h-8 fill-current" />
            Bắt đầu
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin mb-4">
          <RotateCcw className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-600">Đang chuẩn bị câu hỏi...</h2>
        <p className="text-gray-400 mt-2">Bé đợi một xíu nhé!</p>
      </div>
    );
  }

  // Playing Screen
  if (gameState === 'playing') {
    const progress = ((currentIndex) / QUESTION_COUNT) * 100;
    
    return (
      <div className="min-h-screen bg-sky-100 p-4 md:p-8 relative overflow-hidden">
        {/* Feedback Overlay */}
        {lastAnswerCorrect !== null && (
           <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${lastAnswerCorrect ? 'bg-green-500/20' : 'bg-red-500/20'} transition-colors duration-300`}>
             <div className="transform scale-150 animate-bounce">
               {lastAnswerCorrect ? (
                 <span className="text-8xl">🎉</span>
               ) : (
                 <span className="text-8xl">😅</span>
               )}
             </div>
           </div>
        )}

        <div className="max-w-3xl mx-auto">
          {/* Header Stats */}
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border-2 border-white">
             <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                 <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
               </div>
               <span className="text-2xl font-bold text-gray-700">{score}</span>
             </div>
             
             <div className="flex-1 mx-6">
               <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-blue-500 transition-all duration-500 ease-out"
                   style={{ width: `${progress}%` }}
                 ></div>
               </div>
               <div className="text-center text-xs text-gray-400 mt-1 font-bold">
                 Câu {currentIndex + 1} / {QUESTION_COUNT}
               </div>
             </div>

             <div className="flex items-center gap-2">
               <Music className="w-6 h-6 text-purple-400" />
             </div>
          </div>

          <QuizCard 
            question={questions[currentIndex]} 
            onAnswer={handleAnswer} 
            isProcessing={isProcessing}
          />

        </div>
      </div>
    );
  }

  // Result Screen
  if (gameState === 'finished') {
    const percentage = (score / QUESTION_COUNT) * 100;
    let message = "";
    if (percentage === 100) message = "Xuất sắc! Bé là thiên tài!";
    else if (percentage >= 80) message = "Giỏi quá! Bé làm rất tốt!";
    else if (percentage >= 50) message = "Cố gắng lên! Bé làm được mà!";
    else message = "Luyện tập thêm nhé!";

    return (
      <div className="min-h-screen bg-gradient-to-tr from-yellow-100 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-yellow-200">
          <div className="w-40 h-40 bg-yellow-50 rounded-full mx-auto flex items-center justify-center mb-6 float-anim">
            <Trophy className="w-24 h-24 text-yellow-500 fill-yellow-200" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoàn thành!</h2>
          <p className="text-xl text-yellow-600 font-bold mb-6">{message}</p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-2">Điểm số</div>
            <div className="text-5xl font-black text-gray-800">
              {score}<span className="text-2xl text-gray-400">/{QUESTION_COUNT}</span>
            </div>
          </div>

          <button 
            onClick={startGame}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-[0_4px_0_0_#2563eb] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-6 h-6" />
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;