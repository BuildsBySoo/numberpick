/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { GeneratorView } from './components/GeneratorView';
import { SavedListView } from './components/SavedListView';
import type { SavedCombination } from './types';
import {
  saveCombinationToFirestore,
  deleteCombinationFromFirestore,
  subscribeToSavedCombinations,
} from './lib/firebase';

// Helper: Generate 6 unique random integers between 1 and 45, sorted ascending
export function generateLottoNumbers(): number[] {
  const pool: number[] = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked: number[] = [];
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    picked.push(pool[randomIndex]);
    pool.splice(randomIndex, 1);
  }
  return picked.sort((a, b) => a - b);
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<'generator' | 'saved'>('generator');
  const [currentNumbers, setCurrentNumbers] = useState<number[]>(() => generateLottoNumbers());
  const [savedList, setSavedList] = useState<SavedCombination[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState<{
    visible: boolean;
    message: string;
    savedItemLabel?: string;
  } | null>(null);

  // Subscribe to realtime saved combinations from Firestore
  useEffect(() => {
    setIsLoadingSaved(true);
    const unsubscribe = subscribeToSavedCombinations((items) => {
      setSavedList(items);
      setIsLoadingSaved(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Ensure scroll is instantly and cleanly reset to the very top after the tab renders
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentTab]);

  // Regenerate 6 numbers
  const handleRegenerate = useCallback(() => {
    setCurrentNumbers(generateLottoNumbers());
  }, []);

  // Save current combination to Firestore
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
    try {
      const nextIndex = savedList.length + 1;
      const label = `조합 #${nextIndex}`;
      const savedItem = await saveCombinationToFirestore(currentNumbers, label);

      setSaveFeedback({
        visible: true,
        message: '저장되었습니다! 🍀',
        savedItemLabel: savedItem.label || label,
      });

      // Automatically hide banner after 7 seconds
      setTimeout(() => {
        setSaveFeedback((prev) => (prev?.visible ? null : prev));
      }, 7000);

      return true;
    } catch (e) {
      console.error('Failed to save combination:', e);
      setSaveFeedback({
        visible: true,
        message: '저장 중 오류가 발생했습니다. 다시 시도해 주세요.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentNumbers, isSaving, savedList.length]);

  // Delete combination from Firestore
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteCombinationFromFirestore(id);
    } catch (e) {
      console.error('Failed to delete combination:', e);
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-[#2563eb]/20 selection:text-[#004ac6]"
      style={{ overflowAnchor: 'none' }}
    >
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
        savedCount={savedList.length}
      />

      {/* Main Content Area: Responsive mobile centered 480px width */}
      <main className="w-full max-w-[480px] mx-auto px-4 pt-24 pb-20 flex-1">
        {currentTab === 'generator' ? (
          <GeneratorView
            currentNumbers={currentNumbers}
            onRegenerate={handleRegenerate}
            onSave={handleSave}
            onNavigateToSaved={() => {
              setCurrentTab('saved');
            }}
            isSaving={isSaving}
            saveFeedback={saveFeedback}
            onDismissFeedback={() => setSaveFeedback(null)}
          />
        ) : (
          <SavedListView
            savedList={savedList}
            onBackToGenerator={() => {
              setCurrentTab('generator');
            }}
            onDelete={handleDelete}
            isLoading={isLoadingSaved}
          />
        )}
      </main>

      {/* Fixed Bottom Quick Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-lg border-t border-slate-200/70 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] sm:hidden">
        <div className="max-w-[480px] mx-auto px-6 h-14 flex items-center justify-around">
          <button
            onClick={() => {
              setCurrentTab('generator');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              currentTab === 'generator' ? 'text-[#2563eb] font-bold' : 'text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">casino</span>
            <span className="text-[10px]">번호 뽑기</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('saved');
            }}
            className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
              currentTab === 'saved' ? 'text-[#2563eb] font-bold' : 'text-slate-500'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">bookmarks</span>
            <span className="text-[10px]">보관함</span>
            {savedList.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#2563eb] text-white text-[9px] font-bold flex items-center justify-center">
                {savedList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[480px] mx-auto px-4 py-6 text-center text-xs text-slate-400">
        <p>© 2025 NumberPick. 오늘의 행운을 찾아드려요.</p>
      </footer>
    </div>
  );
}
