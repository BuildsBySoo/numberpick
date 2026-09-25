import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { LottoBall } from './LottoBall';
import { AIChatBox } from './AIChatBox';

interface GeneratorViewProps {
  currentNumbers: number[];
  onRegenerate: () => void;
  onSave: () => Promise<boolean>;
  onNavigateToSaved: () => void;
  isSaving: boolean;
  saveFeedback: {
    visible: boolean;
    message: string;
    savedItemLabel?: string;
  } | null;
  onDismissFeedback: () => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  currentNumbers,
  onRegenerate,
  onSave,
  onNavigateToSaved,
  isSaving,
  saveFeedback,
  onDismissFeedback,
}) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleRollClick = () => {
    setIsRolling(true);
    onRegenerate();
    setTimeout(() => {
      setIsRolling(false);
    }, 450);
  };

  const handleSaveWithCelebration = async () => {
    const success = await onSave();
    if (success) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        });
      } catch {
        // ignore confetti errors
      }
    }
  };

  // Quick statistics
  const sum = currentNumbers.reduce((a, b) => a + b, 0);
  const evens = currentNumbers.filter((n) => n % 2 === 0).length;
  const odds = 6 - evens;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Save Success Toast / Feedback Banner (PRD Requirement: "저장되었습니다" + '저장 목록 보기' 링크) */}
      {saveFeedback?.visible && (
        <div className="w-full mb-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-base">check</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-950">
                  {saveFeedback.message}
                </p>
                <p className="text-[11px] text-emerald-700">
                  {saveFeedback.savedItemLabel ? `${saveFeedback.savedItemLabel} 조합이 Firestore에 보관되었습니다.` : '보관함에 안전하게 저장되었습니다.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={onNavigateToSaved}
                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <span>저장 목록 보기</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                onClick={onDismissFeedback}
                className="w-6 h-6 rounded-full text-emerald-700 hover:bg-emerald-100 flex items-center justify-center text-sm"
                title="닫기"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Lotto Ball Hero Card */}
      <section className="relative w-full rounded-3xl bg-white p-5 sm:p-7 text-center shadow-sm border border-slate-200/90 overflow-hidden mb-5">
        {/* Soft background glow & confetti ambient */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-blue-100/60 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none"></div>

        {/* Header Tag */}
        <div className="inline-flex items-center gap-1.5 bg-[#eff4ff] px-3 py-1 rounded-full text-[#004ac6] text-xs font-bold mb-3 border border-blue-100">
          <span className="material-symbols-outlined text-[15px] text-[#006c49]">eco</span>
          <span>1~45 무작위 6개 추첨</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mb-1">
          행운의 번호 조합
        </h1>
        <p className="text-xs sm:text-sm text-[#434655] font-medium mb-6">
          마음에 드는 조합이 나오면 저장해 두세요!
        </p>

        {/* 6 Lotto Balls Centered prominently */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-3 px-1 my-2 overflow-x-auto">
          {currentNumbers.map((num, idx) => (
            <div
              key={`${idx}-${num}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
              className="transform transition-all"
            >
              <LottoBall
                number={num}
                size="md"
                className="sm:scale-110"
                isRolling={isRolling}
              />
            </div>
          ))}
        </div>

        {/* Stats Pill Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            총합 <strong className="text-slate-800">{sum}</strong>
          </span>
          <span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
            홀 <strong className="text-slate-800">{odds}</strong> : 짝 <strong className="text-slate-800">{evens}</strong>
          </span>
        </div>

        {/* Action Buttons: 다시 뽑기 & 저장하기 */}
        <div className="grid grid-cols-2 gap-3 mt-6 max-w-[380px] mx-auto">
          {/* 다시 뽑기 */}
          <button
            onClick={handleRollClick}
            disabled={isRolling || isSaving}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-[#0b1c30] py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 shadow-sm border border-slate-200/80"
          >
            <span
              className={`material-symbols-outlined text-[20px] text-[#2563eb] ${
                isRolling ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span>다시 뽑기</span>
          </button>

          {/* 저장하기 */}
          <button
            onClick={handleSaveWithCelebration}
            disabled={isSaving}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSaving ? 'hourglass_top' : 'bookmark_add'}
            </span>
            <span>{isSaving ? '저장 중...' : '저장하기'}</span>
          </button>
        </div>
      </section>

      {/* P1 Interactive AI Chat Area */}
      <section className="w-full mb-6">
        <AIChatBox
          contextNumbers={currentNumbers}
          onSaveCombination={handleSaveWithCelebration}
        />
      </section>

      {/* Bottom shortcut to Saved List */}
      <section className="w-full pb-2">
        <button
          onClick={onNavigateToSaved}
          className="w-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs sm:text-sm font-bold transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">bookmarks</span>
            <span>내가 저장한 번호 목록 확인하기</span>
          </div>
          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
            chevron_right
          </span>
        </button>
      </section>
    </div>
  );
};
