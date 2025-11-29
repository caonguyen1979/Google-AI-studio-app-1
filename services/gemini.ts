import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Local fallback questions if API is missing or fails
const FALLBACK_QUESTIONS: Question[] = [
  { id: 1, text: "2 + 3 = ?", num1: 2, num2: 3, operator: '+', correctAnswer: 5, options: [4, 5, 6, 7], visualType: 'apples', isWordProblem: false },
  { id: 2, text: "5 - 1 = ?", num1: 5, num2: 1, operator: '-', correctAnswer: 4, options: [2, 3, 4, 5], visualType: 'stars', isWordProblem: false },
  { id: 3, text: "Lan có 3 cái kẹo, mẹ cho thêm 2 cái. Hỏi Lan có tất cả bao nhiêu cái kẹo?", num1: 3, num2: 2, operator: '+', correctAnswer: 5, options: [4, 5, 6, 3], visualType: 'cookies', isWordProblem: true },
  { id: 4, text: "4 + 4 = ?", num1: 4, num2: 4, operator: '+', correctAnswer: 8, options: [7, 8, 9, 6], visualType: 'cats', isWordProblem: false },
  { id: 5, text: "Trên cây có 7 con chim, 2 con bay đi. Hỏi còn lại bao nhiêu con?", num1: 7, num2: 2, operator: '-', correctAnswer: 5, options: [4, 5, 6, 9], visualType: 'apples', isWordProblem: true },
];

export const generateQuestions = async (count: number = 30): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;

  // Use fallback if no key is provided
  if (!apiKey) {
    console.warn("No API_KEY found. Using fallback questions.");
    return generateLocalQuestions(count);
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} math questions for 1st grade students (approx 6 years old) in Vietnamese. 
      The range is within 10 (sum <= 10, subtraction result >= 0).
      
      Requirements:
      1. Mixed types: 70% simple equations (e.g., "3 + 2 = ?"), 30% simple word problems (e.g., "Có 3 quả táo...").
      2. Vary the visual items suggestions (apples, stars, cats, cookies).
      3. For word problems, ensure the language is simple and natural for a Vietnamese child.
      4. Ensure 'options' array contains the correct answer and 3 incorrect but plausible answers.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              text: { type: Type.STRING, description: "The question text to display" },
              num1: { type: Type.INTEGER, description: "First number in the operation" },
              num2: { type: Type.INTEGER, description: "Second number in the operation" },
              operator: { type: Type.STRING, enum: ["+", "-"] },
              correctAnswer: { type: Type.INTEGER },
              options: { type: Type.ARRAY, items: { type: Type.INTEGER } },
              visualType: { type: Type.STRING, enum: ["apples", "stars", "cats", "cookies"] },
              isWordProblem: { type: Type.BOOLEAN }
            },
            required: ["id", "text", "num1", "num2", "operator", "correctAnswer", "options", "visualType", "isWordProblem"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Validate data integrity
    if (Array.isArray(data) && data.length > 0) {
      return data as Question[];
    } else {
      throw new Error("Empty response from Gemini");
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    // On error, generate local questions algorithmically to ensure the app still works
    return generateLocalQuestions(count);
  }
};

// Algorithmic generation fallback
const generateLocalQuestions = (count: number): Question[] => {
  const questions: Question[] = [];
  const visualTypes = ['apples', 'stars', 'cats', 'cookies'] as const;

  for (let i = 0; i < count; i++) {
    const isAddition = Math.random() > 0.5;
    let num1, num2, ans;

    if (isAddition) {
      // Sum <= 10
      num1 = Math.floor(Math.random() * 6); // 0-5
      num2 = Math.floor(Math.random() * (11 - num1)); // ensuring sum <= 10
      ans = num1 + num2;
    } else {
      // Result >= 0
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * (num1 + 1));
      ans = num1 - num2;
    }

    // Generate options
    const options = new Set<number>();
    options.add(ans);
    while (options.size < 4) {
      let opt = Math.floor(Math.random() * 11);
      if (opt !== ans) options.add(opt);
    }

    questions.push({
      id: i,
      text: `${num1} ${isAddition ? '+' : '-'} ${num2} = ?`,
      num1,
      num2,
      operator: isAddition ? '+' : '-',
      correctAnswer: ans,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      visualType: visualTypes[Math.floor(Math.random() * visualTypes.length)],
      isWordProblem: false
    });
  }
  return questions;
};