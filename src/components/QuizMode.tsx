import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  Filter,
  BarChart3,
  Award,
  BookOpen,
} from 'lucide-react';
import { Language } from '../data/i18n';
import {
  EXPANDED_QUIZ_QUESTIONS,
  QUIZ_CATEGORIES,
  QuizQuestion,
} from '../data/quizQuestions';

interface QuizModeProps {
  language?: Language;
}

interface QuestionReviewRecord {
  question: QuizQuestion;
  selectedOptionId: string;
  isCorrect: boolean;
}

export const QuizMode: React.FC<QuizModeProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  // Session configuration
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [questionCountLimit, setQuestionCountLimit] = useState<number>(10);

  // Active round state
  const [roundQuestions, setRoundQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);
  const [reviewRecords, setReviewRecords] = useState<QuestionReviewRecord[]>([]);

  // Function to initialize a new randomized round with NO repeats
  const startNewRound = (
    cat = selectedCategory,
    diff = selectedDifficulty,
    limit = questionCountLimit
  ) => {
    let pool = EXPANDED_QUIZ_QUESTIONS;

    if (cat !== 'all') {
      pool = pool.filter((q) => q.category === cat);
    }

    if (diff !== 'All') {
      pool = pool.filter((q) => q.difficulty === diff);
    }

    // Fallback if filter is too narrow
    if (pool.length === 0) {
      pool = EXPANDED_QUIZ_QUESTIONS;
    }

    // Fisher-Yates shuffle for true randomization with no repeats
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

    setRoundQuestions(selected);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setIsRoundFinished(false);
    setReviewRecords([]);
  };

  // Initialize round on mount
  useEffect(() => {
    startNewRound('all', 'All', 10);
  }, []);

  const activeQuestion = roundQuestions[currentIdx];

  const handleSelectOption = (id: string) => {
    if (isAnswerSubmitted || isRoundFinished) return;
    setSelectedOptionId(id);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted || !activeQuestion) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOptionId === activeQuestion.correctId;
    const newRecord: QuestionReviewRecord = {
      question: activeQuestion,
      selectedOptionId,
      isCorrect,
    };
    setReviewRecords((prev) => [...prev, newRecord]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 >= roundQuestions.length) {
      setIsRoundFinished(true);
    } else {
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const accuracyPercent =
    roundQuestions.length > 0 ? Math.round((score / roundQuestions.length) * 100) : 0;

  const wrongAnswers = useMemo(
    () => reviewRecords.filter((r) => !r.isCorrect),
    [reviewRecords]
  );

  return (
    <div className="space-y-6">
      {/* Header and Stats Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
              <GraduationCap className="w-3.5 h-3.5" /> Comprehensive Board Exam Preparation
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isAr ? 'اختبار علم الأحياء الدقيقة التفاعلي' : 'Microbiology Mastery & Diagnostic Quiz'}
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {isAr
                ? `بنك أسئلة علمي شامل يضم ${EXPANDED_QUIZ_QUESTIONS.length} سؤالاً عبر صبغة غرام، الفحوصات الكيموحيوية، أوساط الزراعة، مقاومة المضادات، الفيروسات، الفطريات، الطفيليات، والحالات السريرية.`
                : `Comprehensive question bank with ${EXPANDED_QUIZ_QUESTIONS.length}+ questions spanning Gram stain, biochemical tests, IMViC, AST resistance, virology, mycology, parasitology, and clinical vignettes.`}
            </p>
          </div>

          {/* Gamified Live Score Counter */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center min-w-[85px]">
              <div className="text-[10px] text-slate-500 uppercase font-bold">
                {isAr ? 'الدرجة' : 'Score'}
              </div>
              <div className="text-lg font-bold text-slate-900">
                {score} / {roundQuestions.length}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center min-w-[85px]">
              <div className="text-[10px] text-amber-700 uppercase font-bold flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {isAr ? 'التتابع' : 'Streak'}
              </div>
              <div className="text-lg font-bold text-amber-900">{streak}</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center min-w-[85px]">
              <div className="text-[10px] text-blue-700 uppercase font-bold flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-blue-500" />
                {isAr ? 'الدقة' : 'Accuracy'}
              </div>
              <div className="text-lg font-bold text-blue-900">{accuracyPercent}%</div>
            </div>
          </div>
        </div>

        {/* Quiz Controls & Filters Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Category Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">{isAr ? 'المجال:' : 'Category:'}</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setSelectedCategory(newCat);
                  startNewRound(newCat, selectedDifficulty, questionCountLimit);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {QUIZ_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.labelAr : c.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">{isAr ? 'الصعوبة:' : 'Difficulty:'}</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      startNewRound(selectedCategory, diff, questionCountLimit);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff === 'All' ? (isAr ? 'الكل' : 'All') : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Option (10, 20, 30) */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500">{isAr ? 'العدد:' : 'Questions:'}</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                {[10, 20, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setQuestionCountLimit(num);
                      startNewRound(selectedCategory, selectedDifficulty, num);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      questionCountLimit === num
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* New Random Round Button */}
          <button
            onClick={() => startNewRound()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>{isAr ? 'جولة عشوائية جديدة' : 'New Random Round'}</span>
          </button>
        </div>
      </div>

      {/* FINAL SCORE SCREEN WITH WRONG ANSWERS REVIEW */}
      {isRoundFinished ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {isAr ? 'اكتملت الجولة الاختبارية!' : 'Quiz Round Completed!'}
            </h3>
            <p className="text-sm text-slate-600">
              {isAr
                ? `لقد أجبت بشكل صحيح على ${score} من أصل ${roundQuestions.length} سؤالاً (${accuracyPercent}%).`
                : `You answered ${score} out of ${roundQuestions.length} questions correctly (${accuracyPercent}%).`}
            </p>

            <div className="grid grid-cols-3 gap-3 py-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">{isAr ? 'المجموع' : 'Total'}</div>
                <div className="text-xl font-bold text-slate-900">{roundQuestions.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-bold text-emerald-700 uppercase">{isAr ? 'صحيحة' : 'Correct'}</div>
                <div className="text-xl font-bold text-emerald-800">{score}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-[11px] font-bold text-rose-700 uppercase">{isAr ? 'خاطئة' : 'Incorrect'}</div>
                <div className="text-xl font-bold text-rose-800">{roundQuestions.length - score}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => startNewRound()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isAr ? 'بدء جولة جديدة' : 'Start Another Round'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Wrong Answers Review Section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-600" />
                <span>
                  {isAr
                    ? `مراجعة الأسئلة والإجابات الخاطئة (${wrongAnswers.length}):`
                    : `Review of Incorrect Answers (${wrongAnswers.length}):`}
                </span>
              </h4>
            </div>

            {wrongAnswers.length === 0 ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900 font-semibold text-sm">
                🎉 {isAr ? 'رائع جداً! لقد أجبت على جميع الأسئلة بشكل صحيح دون أي خطأ.' : 'Flawless performance! You scored 100% with no incorrect answers in this round.'}
              </div>
            ) : (
              <div className="space-y-4">
                {wrongAnswers.map((rec, idx) => {
                  const q = rec.question;
                  const chosenOpt = q.options.find((o) => o.id === rec.selectedOptionId);
                  const correctOpt = q.options.find((o) => o.id === q.correctId);

                  return (
                    <div
                      key={q.id + idx}
                      className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3 text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-500 uppercase text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                          {q.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm">
                        {isAr ? q.questionAr : q.questionEn}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-950">
                          <span className="font-bold block text-[10px] uppercase text-rose-700">
                            {isAr ? 'إجابتك المختارة (خاطئة):' : 'Your Answer (Incorrect):'}
                          </span>
                          <span className="font-semibold">
                            {isAr ? chosenOpt?.textAr : chosenOpt?.textEn}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-950">
                          <span className="font-bold block text-[10px] uppercase text-emerald-700">
                            {isAr ? 'الإجابة العلمية الصحيحة:' : 'Correct Answer:'}
                          </span>
                          <span className="font-semibold">
                            {isAr ? correctOpt?.textAr : correctOpt?.textEn}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-0.5">
                          {isAr ? 'التعليل والتفسير العلمي:' : 'Scientific Explanation:'}
                        </strong>
                        {isAr ? q.explanationAr : q.explanationEn}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : activeQuestion ? (
        /* ACTIVE QUESTION CARD */
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Question progress and category badges */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {isAr
                  ? `السؤال ${currentIdx + 1} من ${roundQuestions.length}`
                  : `Question ${currentIdx + 1} of ${roundQuestions.length}`}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase">
                {activeQuestion.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  activeQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeQuestion.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {activeQuestion.difficulty}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{
                  width: `${((currentIdx + 1) / roundQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Prompt Text */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {isAr ? activeQuestion.questionAr : activeQuestion.questionEn}
          </h3>

          {/* Multiple Choice Options List */}
          <div className="space-y-3">
            {activeQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrect = opt.id === activeQuestion.correctId;

              let btnStyle = 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-slate-800';

              if (isSelected && !isAnswerSubmitted) {
                btnStyle = 'border-blue-600 bg-blue-50 ring-2 ring-blue-200 text-blue-900 font-semibold';
              } else if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-semibold';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between gap-3 text-xs sm:text-sm transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {opt.id}
                    </span>
                    <span>{isAr ? opt.textAr : opt.textEn}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Bar: Check / Next */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {!isAnswerSubmitted && (
                <span>{isAr ? 'اختر الإجابة ثم اضغط تأكيد' : 'Select an answer to confirm'}</span>
              )}
            </div>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-colors"
              >
                {isAr ? 'تأكيد الإجابة' : 'Check Answer'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <span>
                  {currentIdx + 1 >= roundQuestions.length
                    ? isAr
                      ? 'عرض النتيجة النهائية'
                      : 'View Final Score'
                    : isAr
                    ? 'السؤال التالي'
                    : 'Next Question'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Scientific Explanation Reveal */}
          {isAnswerSubmitted && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                selectedOptionId === activeQuestion.correctId
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {isAr ? 'التفسير العلمي والمصادر المعتمدة:' : 'Scientific Rationale & References:'}
              </div>
              <p>{isAr ? activeQuestion.explanationAr : activeQuestion.explanationEn}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
