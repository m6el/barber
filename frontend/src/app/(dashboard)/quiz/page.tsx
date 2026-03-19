'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateQuiz, QuizQuestion } from '@/lib/api';

const TOPICS = [
  { id: 'components-of-computer-systems', label: 'Computer Systems' },
  { id: 'software-and-development', label: 'Software & Development' },
  { id: 'exchanging-data', label: 'Exchanging Data' },
  { id: 'data-types-structures-algorithms', label: 'Data & Algorithms' },
  { id: 'the-internet', label: 'The Internet' },
  { id: 'implications', label: 'Digital Implications' },
  { id: 'programming', label: 'Programming' },
  { id: 'algorithms', label: 'Algorithms' },
];

interface AnsweredQuestion extends QuizQuestion {
  selected: string | null;
  correct: boolean;
}

export default function QuizPage() {
  const { token } = useAuth();
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<AnsweredQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  async function startQuiz() {
    if (!token) return;
    setIsLoading(true);
    setError('');
    setQuestions([]);
    setCurrentIndex(0);
    setQuizComplete(false);
    setShowResult(false);

    try {
      const data = await generateQuiz(token, topic, count, difficulty);
      setQuestions(
        data.questions.map((q) => ({ ...q, selected: null, correct: false }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswer(optionLetter: string) {
    if (showResult) return;
    const current = questions[currentIndex];
    const correct = optionLetter === current.answer;

    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, selected: optionLetter, correct } : q
      )
    );
    setShowResult(true);
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setShowResult(false);
    }
  }

  const score = questions.filter((q) => q.correct).length;
  const topicLabel = TOPICS.find((t) => t.id === topic)?.label || topic;

  // Quiz setup screen
  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✏️ Practice Quiz</h1>
          <p className="text-gray-500 mt-1">AI-generated multiple choice questions on any GCSE OCR CS topic</p>
        </div>

        <div className="max-w-lg bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            >
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors capitalize ${
                    difficulty === d
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of questions: <span className="text-indigo-600 font-bold">{count}</span>
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={startQuiz}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating quiz...
              </span>
            ) : (
              `Start Quiz (${count} questions)`
            )}
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (quizComplete) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Needs work' : 'Keep practising';
    const gradeColor = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">✏️ Quiz Results</h1>

        <div className="max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="text-center py-4">
            <div className="text-6xl font-black text-gray-800 mb-1">{pct}%</div>
            <div className={`text-2xl font-bold ${gradeColor} mb-1`}>{grade}</div>
            <p className="text-gray-500">
              {score} / {questions.length} correct · {topicLabel} · {difficulty}
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  q.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <p className="font-medium text-gray-800 mb-2">
                  {i + 1}. {q.question}
                </p>
                <p className={`text-sm font-medium ${q.correct ? 'text-green-700' : 'text-red-700'}`}>
                  {q.correct ? '✓' : '✗'} Your answer: {q.selected}
                  {!q.correct && ` · Correct: ${q.answer}`}
                </p>
                <p className="text-sm text-gray-600 mt-1">{q.explanation}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setQuestions([])}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Try Another Quiz
          </button>
        </div>
      </div>
    );
  }

  // Active quiz
  const current = questions[currentIndex];
  const optionLetters = current.options.map((o) => o.charAt(0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">✏️ {topicLabel} Quiz</h1>
        <span className="text-sm text-gray-500 font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
          style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <p className="text-lg font-semibold text-gray-800">{current.question}</p>

        <div className="space-y-3">
          {current.options.map((option, i) => {
            const letter = optionLetters[i];
            const isSelected = current.selected === letter;
            const isCorrect = current.answer === letter;

            let style = 'border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50';
            if (showResult) {
              if (isCorrect) style = 'border-green-400 bg-green-50 text-green-800';
              else if (isSelected && !isCorrect) style = 'border-red-400 bg-red-50 text-red-800';
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(letter)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all disabled:cursor-default ${style}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`p-4 rounded-lg ${current.correct ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`font-semibold mb-1 ${current.correct ? 'text-green-700' : 'text-amber-700'}`}>
              {current.correct ? '✓ Correct!' : `✗ The correct answer is ${current.answer}`}
            </p>
            <p className="text-sm text-gray-700">{current.explanation}</p>
          </div>
        )}

        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
