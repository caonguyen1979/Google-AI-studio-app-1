import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import VisualCounter from './VisualCounter';

interface QuizCardProps {
  question: Question;
  onAnswer: (answer: number) => void;
  isProcessing: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, isProcessing }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Reset selected option when question changes
  useEffect(() => {
    setSelectedOption(null);
  }, [question.id]);

  const handleOptionClick = (option: number) => {
    if (isProcessing) return;
    setSelectedOption(option);
    onAnswer(option);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 w-full max-w-2xl mx-auto border-4 border-blue-200">
      
      {/* Visual Representation Area */}
      <div className="flex items-center justify-center space-x-4 mb-8 min-h-[120px] bg-blue-50 rounded-2xl p-4">
        <div className="flex flex-col items-center">
          <VisualCounter count={question.num1} type={question.visualType} />
          <span className="text-2xl font-bold text-blue-600 mt-2">{question.num1}</span>
        </div>
        
        <div className="text-4xl font-black text-gray-400">
          {question.operator === '+' ? '+' : '-'}
        </div>

        <div className="flex flex-col items-center">
          <VisualCounter count={question.num2} type={question.visualType} />
          <span className="text-2xl font-bold text-blue-600 mt-2">{question.num2}</span>
        </div>
      </div>

      {/* Text Question */}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8 leading-relaxed">
        {question.text}
      </h2>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          
          let buttonClasses = `
            h-24 text-4xl font-bold rounded-2xl transition-all transform shadow-[0_4px_0_0_rgba(0,0,0,0.1)] border-4
          `;

          if (isProcessing) {
            if (isSelected) {
              if (isCorrect) {
                buttonClasses += " bg-green-500 border-green-600 text-white scale-110 z-10";
              } else {
                buttonClasses += " bg-red-500 border-red-600 text-white shake";
              }
            } else if (isCorrect && selectedOption !== null) {
              // Highlight the correct answer if the user picked the wrong one
              buttonClasses += " bg-green-100 border-green-400 text-green-600";
            } else {
              // Dim other options
              buttonClasses += " bg-gray-100 border-gray-200 text-gray-300 opacity-50 scale-95";
            }
          } else {
            // Default interactive state
            buttonClasses += " hover:scale-105 active:scale-95 hover:-translate-y-1 bg-white cursor-pointer";
            if (idx % 4 === 0) buttonClasses += ' border-red-200 text-red-500 hover:bg-red-50';
            else if (idx % 4 === 1) buttonClasses += ' border-green-200 text-green-500 hover:bg-green-50';
            else if (idx % 4 === 2) buttonClasses += ' border-yellow-200 text-yellow-600 hover:bg-yellow-50';
            else buttonClasses += ' border-purple-200 text-purple-500 hover:bg-purple-50';
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={isProcessing}
              className={buttonClasses}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizCard;