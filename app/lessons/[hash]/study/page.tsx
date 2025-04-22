"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getLesson } from "../../../../app/pinata";
import { notFound } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import { use } from "react";

interface StudyPageProps {
  params: Promise<{
    hash: string;
  }>;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function StudyPage({ params }: StudyPageProps) {
  const { hash } = use(params);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const lessonData = await getLesson(hash);
        setLesson(lessonData);
        const quizData = await generateQuiz(lessonData.content);
        setQuiz(quizData);
        setSelectedAnswers(new Array(quizData.length).fill(-1));
        setAnsweredQuestions(new Array(quizData.length).fill(false));
      } catch (error) {
        console.error(`Error loading lesson:`, error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [hash]);

  const handleAnswerSubmit = (questionIndex: number) => {
    if (selectedAnswers[questionIndex] === -1) return;
    
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[questionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (answeredQuestions[questionIndex]) return; // Prevent selecting after answer
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-8 py-4 md:py-24">
        <div className="flex justify-between items-center mb-12">
          <Link href={`/lessons/${hash}`} className="flex items-center hover:text-blue-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lesson
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-8 py-4 md:py-24">
      <div className="flex justify-between items-center mb-12">
        <Link href={`/lessons/${hash}`} className="flex items-center hover:text-blue-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lesson
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{lesson?.title}</h1>
        
        <div className="space-y-6">
          {quiz.map((question: QuizQuestion, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{index + 1}. {question.question}</h3>
              <div className="space-y-2">
                {question.options.map((option: string, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      type="radio"
                      id={`q${index}-o${optionIndex}`}
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={selectedAnswers[index] === optionIndex}
                      onChange={() => handleAnswerSelect(index, optionIndex)}
                      disabled={answeredQuestions[index]} // Disable if answered
                      className={`mr-2 ${answeredQuestions[index] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    <label htmlFor={`q${index}-o${optionIndex}`} className={answeredQuestions[index] ? 'text-gray-500' : ''}>
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              {answeredQuestions[index] && (
                <div className={`mt-4 p-3 rounded-md ${
                  selectedAnswers[index] === question.correctAnswer 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAnswers[index] === question.correctAnswer 
                    ? 'Correct! Well done!' 
                    : 'Incorrect.'}
                </div>
              )}
              <button 
                type="button"
                onClick={() => handleAnswerSubmit(index)}
                disabled={selectedAnswers[index] === -1 || answeredQuestions[index]}
                className={`mt-4 px-4 py-2 rounded-md transition-colors ${
                  selectedAnswers[index] === -1 || answeredQuestions[index]
                    ? 'bg-white text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                }`}
              >
                {answeredQuestions[index] ? 'Answered' : 'Submit Answer'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

async function generateQuiz(lessonContent: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Gemini API key is not set");
    return [];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash"
  });

  const prompt = `Create a quiz with 5 multiple choice questions based on the following lesson content. 
  Format each question as JSON with the following structure:
  {
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0
  }
  Return only the JSON array of questions, nothing else.
  
  Lesson content:
  ${lessonContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
}
