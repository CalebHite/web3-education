interface QuizQuestion {
  question: string;
  choices: string[];
  correctAnswer: number;
}

export function Quiz({ question, choices, correctAnswer }: QuizQuestion) {
  return (
    <div className="my-6 p-6 border rounded-lg shadow-sm bg-muted/50">
      <h3 className="text-lg font-semibold mb-4">{question}</h3>
      <div className="space-y-2">
        {choices.map((choice, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="radio"
              name="quiz"
              id={`choice-${index}`}
              className="h-4 w-4"
              disabled
              checked={index === correctAnswer}
            />
            <label htmlFor={`choice-${index}`} className="text-sm">
              {choice}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}