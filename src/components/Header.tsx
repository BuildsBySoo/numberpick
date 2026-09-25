import React from 'react';

interface HeaderProps {
  currentTab: 'generator' | 'saved';
  onSelectTab: (tab: 'generator' | 'saved') => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-[480px] mx-auto px-4 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onSelectTab('generator')}
          className="flex items-center gap-1.5 focus:outline-none group text-left"
          title="NumberPick 홈으로"
        >
          <span className="material-symbols-outlined text-[#006c49] text-2xl group-hover:rotate-12 transition-transform select-none">
            eco
          </span>
          <div className="flex items-center text-xl font-extrabold tracking-tight">
            <span className="text-[#004ac6]">Number</span>
            <span className="text-[#0b1c30]">Pick</span>
          </div>
        </button>

        {/* Navigation Tabs & Avatar */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('generator')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                currentTab === 'generator'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30] hover:bg-white/60'
              }`}
            >
              번호생성
            </button>
            <button
              onClick={() => onSelectTab('saved')}
              className={`relative px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1 ${
                currentTab === 'saved'
                  ? 'bg-[#2563eb] text-white shadow-sm'
                  : 'text-[#434655] hover:text-[#0b1c30] hover:bg-white/60'
              }`}
            >
              <span>보관함</span>
              {savedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    currentTab === 'saved'
                      ? 'bg-white text-[#2563eb]'
                      : 'bg-[#2563eb] text-white'
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* User profile avatar matching reference */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[1.5px] shadow-sm ml-1 select-none flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-slate-600 text-lg">
                sentiment_very_satisfied
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub greeting ticker */}
      <div className="bg-[#eff4ff] border-t border-b border-[#e2e8f0]/40 px-4 py-1.5 text-center">
        <p className="text-[#434655] text-xs sm:text-[13px] font-medium flex items-center justify-center gap-1.5">
          <span>오늘도 좋은 숫자가 당신을 기다리고 있어요!</span>
          <span className="text-sm">😊</span>
        </p>
      </div>
    </header>
  );
};
