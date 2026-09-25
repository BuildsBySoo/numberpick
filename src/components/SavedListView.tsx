import React, { useState } from 'react';
import type { SavedCombination } from '../types';
import { LottoBall } from './LottoBall';

interface SavedListViewProps {
  savedList: SavedCombination[];
  onBackToGenerator: () => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const SavedListView: React.FC<SavedListViewProps> = ({
  savedList,
  onBackToGenerator,
  onDelete,
  isLoading = false,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<SavedCombination | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}. ${mm}. ${dd} ${hh}:${min}`;
  };

  const handleDeleteConfirm = async () => {
    if (!confirmTarget || deletingId) return;
    const targetId = confirmTarget.id;
    setDeletingId(targetId);
    try {
      await onDelete(targetId);
      setConfirmTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (item: SavedCombination) => {
    const text = `${item.label || '행운 번호'}: ${item.numbers.join(', ')}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Top Navigation & Header */}
      <section className="flex flex-col gap-3 mb-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToGenerator}
            className="inline-flex items-center gap-1.5 bg-[#dce9ff] hover:bg-[#cbdbf5] text-[#0b1c30] px-3.5 py-1.5 rounded-xl transition-all group font-semibold text-xs sm:text-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>추첨으로 돌아가기</span>
          </button>

          <button
            onClick={onBackToGenerator}
            className="inline-flex items-center gap-1.5 bg-[#2563eb] hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm sm:text-base">casino</span>
            <span>새 번호 뽑기</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0b1c30] tracking-tight">
              저장 목록
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#d3e4fe] text-[#004ac6] font-bold text-xs">
              총 {savedList.length}개
            </span>
          </div>
        </div>
        <p className="text-[#434655] text-xs sm:text-sm -mt-1 font-medium">
          내가 보관해 둔 행운의 번호 조합들이에요.
        </p>
      </section>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping"></span>
          <span>보관함 번호를 동기화하는 중...</span>
        </div>
      )}

      {/* Empty State when 0 items */}
      {savedList.length === 0 && !isLoading && (
        <>
          <section className="relative w-full rounded-2xl bg-white p-6 sm:p-8 text-center shadow-sm border border-slate-200/80 overflow-hidden mb-5">
            {/* Ambient Pastel Glows */}
            <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-emerald-200/20 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-blue-200/30 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Playful Illustration: Ball with Question Mark */}
              <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#eff4ff] animate-pulse"></div>
                <svg
                  className="w-24 h-24 drop-shadow-sm select-none"
                  fill="none"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <ellipse
                    className="text-[#dce9ff]"
                    cx="50"
                    cy="74"
                    fill="currentColor"
                    rx="36"
                    ry="10"
                  ></ellipse>
                  <ellipse
                    className="text-[#e5eeff]"
                    cx="50"
                    cy="72"
                    fill="currentColor"
                    rx="30"
                    ry="7"
                  ></ellipse>
                  <g>
                    <circle cx="50" cy="46" fill="url(#ballGradEmpty)" r="26"></circle>
                    <circle
                      cx="42"
                      cy="38"
                      fill="url(#glossGradEmpty)"
                      opacity="0.85"
                      r="14"
                    ></circle>
                    <ellipse
                      cx="50"
                      cy="70"
                      fill="#000000"
                      opacity="0.08"
                      rx="16"
                      ry="4"
                    ></ellipse>
                    <text
                      fill="#ffffff"
                      fontFamily="Plus Jakarta Sans"
                      fontSize="20"
                      fontWeight="800"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
                      textAnchor="middle"
                      x="50"
                      y="52"
                    >
                      ?
                    </text>
                  </g>
                  <circle cx="20" cy="32" fill="#6cf8bb" r="3"></circle>
                  <path d="M78 28 L81 33 L75 33 Z" fill="#ffb95f" opacity="0.8"></path>
                  <circle cx="82" cy="62" fill="#2563eb" opacity="0.6" r="2.5"></circle>
                  <rect
                    fill="#ffddb8"
                    height="4"
                    rx="1"
                    transform="rotate(25 18 58)"
                    width="4"
                    x="18"
                    y="58"
                  ></rect>
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      id="ballGradEmpty"
                      x1="30"
                      x2="68"
                      y1="24"
                      y2="70"
                    >
                      <stop stopColor="#38bdf8"></stop>
                      <stop offset="0.5" stopColor="#2563eb"></stop>
                      <stop offset="1" stopColor="#003ea8"></stop>
                    </linearGradient>
                    <radialGradient
                      cx="0"
                      cy="0"
                      gradientTransform="translate(42 38) scale(14)"
                      gradientUnits="userSpaceOnUse"
                      id="glossGradEmpty"
                      r="1"
                    >
                      <stop stopColor="#ffffff"></stop>
                      <stop offset="1" stopColor="#ffffff" stopOpacity="0"></stop>
                    </radialGradient>
                  </defs>
                </svg>

                {/* Floating Clover Badge */}
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#006c49] flex items-center justify-center text-white shadow-md animate-bounce">
                  <span className="material-symbols-outlined text-[18px]">eco</span>
                </div>
              </div>

              {/* Informative Headlines */}
              <h2 className="text-xl font-extrabold text-[#0b1c30] mt-3 mb-1 tracking-tight">
                아직 저장한 조합이 없어요
              </h2>
              <p className="text-xs sm:text-sm text-[#434655] max-w-[320px] mx-auto leading-relaxed">
                오늘의 행운을 불러올 번호를 직접 뽑고 마음에 드는 번호를 보관해 보세요! 🍀
              </p>

              {/* Primary Action CTA */}
              <div className="w-full max-w-[280px] mt-5">
                <button
                  onClick={onBackToGenerator}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-blue-700 text-white py-3 px-5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">casino</span>
                  <span>행운의 번호 뽑으러 가기</span>
                </button>
              </div>

              {/* Quick Feature Highlights */}
              <div className="w-full mt-6 pt-4 border-t border-slate-100 flex justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#004ac6] mb-1">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </div>
                  <span className="text-xs font-semibold text-[#0b1c30]">무제한 생성</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#006c49] mb-1">
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                  </div>
                  <span className="text-xs font-semibold text-[#0b1c30]">간편 보관</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contextual Tip Card */}
          <section className="rounded-xl bg-[#eff4ff] p-4 flex items-start gap-3 border border-blue-100/60">
            <div className="w-6 h-6 rounded-full bg-[#d3e4fe] flex items-center justify-center shrink-0 mt-0.5 text-[#004ac6]">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-xs font-bold text-[#0b1c30]">보관함 이용 꿀팁</h3>
              <p className="text-xs text-[#434655] leading-relaxed">
                메인 추첨 화면에서 번호를 뽑은 후{' '}
                <span className="text-[#004ac6] font-bold">‘저장하기’</span> 버튼을 누르면
                언제든 여기에 안전하게 보관되고 회차별 결과와 대조할 수 있어요.
              </p>
            </div>
          </section>
        </>
      )}

      {/* Populated List: Matches Image 1.png */}
      {savedList.length > 0 && (
        <div className="flex flex-col gap-3.5 mb-6">
          {savedList.map((item, index) => {
            const displayLabel = item.label || `조합 #${savedList.length - index}`;
            const isDeleting = deletingId === item.id;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm transition-all hover:shadow-md"
              >
                {/* Card Top: Label, Date & Delete Action */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                    <span className="text-[#2563eb] font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {displayLabel}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px] sm:text-xs">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#2563eb] px-1.5 py-0.5 rounded transition-colors"
                      title="번호 복사"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isCopied ? 'check' : 'content_copy'}
                      </span>
                      <span>{isCopied ? '복사됨' : '복사'}</span>
                    </button>

                    <button
                      onClick={() => setConfirmTarget(item)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors py-0.5 px-1.5 rounded text-xs font-medium hover:bg-rose-50 disabled:opacity-50"
                      title="이 조합 삭제"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                      <span>삭제</span>
                    </button>
                  </div>
                </div>

                {/* 6 Lotto Balls Centered */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 py-1 overflow-x-auto">
                  {item.numbers.map((num, i) => (
                    <LottoBall key={`${item.id}-ball-${i}`} number={num} size="md" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 w-full max-w-[340px] shadow-xl border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>

            <h3 className="text-base font-bold text-[#0b1c30] mb-1">
              이 번호 조합을 삭제할까요?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              보관함에서 <span className="font-semibold text-slate-700">{confirmTarget.label || '해당 조합'}</span> [{confirmTarget.numbers.join(', ')}]이 영구적으로 제거됩니다.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={deletingId !== null}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {deletingId ? (
                  <span>삭제 중...</span>
                ) : (
                  <span>삭제하기</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
