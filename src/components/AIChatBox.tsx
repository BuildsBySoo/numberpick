import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface AIChatBoxProps {
  contextNumbers: number[];
  className?: string;
  onSaveCombination?: () => void;
}

export const AIChatBox: React.FC<AIChatBoxProps> = ({
  contextNumbers,
  className = '',
  onSaveCombination,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or update chat when context numbers change
  useEffect(() => {
    const formattedNums = contextNumbers.join(', ');
    const initialGreeting: ChatMessage = {
      id: 'msg-init-' + Date.now(),
      sender: 'assistant',
      text: `안녕하세요! 현재 화면의 행운 번호 **[${formattedNums}]** 조합을 분석할 준비가 되었습니다. 홀짝 통계, 번호대별 분포, 혹은 특별한 분석 질문이 있으시면 언제든 물어보세요!`,
      timestamp: Date.now(),
      status: 'delivered',
      contextNumbers: [...contextNumbers],
      suggestedFollowUps: [
        '홀짝 비율과 번호 총합 분석',
        '구간별(1~10, 11~20...) 분포는?',
        '연속 번호나 동끝수가 있나요?',
        '이 조합에 대한 행운 메시지',
      ],
    };
    setMessages([initialGreeting]);
  }, [contextNumbers.join(',')]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Generate realistic simulated AI response based on context numbers
  const generateSimulatedResponse = (query: string, numbers: number[]): { reply: string; followUps: string[] } => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const evens = numbers.filter((n) => n % 2 === 0).length;
    const odds = 6 - evens;

    const range1 = numbers.filter((n) => n <= 10).length;
    const range2 = numbers.filter((n) => n >= 11 && n <= 20).length;
    const range3 = numbers.filter((n) => n >= 21 && n <= 30).length;
    const range4 = numbers.filter((n) => n >= 31 && n <= 40).length;
    const range5 = numbers.filter((n) => n >= 41 && n <= 45).length;

    // Check consecutive numbers
    const consecutivePairs: string[] = [];
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] === numbers[i] + 1) {
        consecutivePairs.push(`${numbers[i]}-${numbers[i + 1]}`);
      }
    }

    if (query.includes('홀짝') || query.includes('총합')) {
      const oddEvenDesc =
        odds === evens
          ? '홀수 3개, 짝수 3개로 이상적인 3:3 황금 밸런스를 보여줍니다.'
          : odds > evens
          ? `홀수 ${odds}개, 짝수 ${evens}개로 홀수가 우세한 공격적인 조합입니다.`
          : `홀수 ${odds}개, 짝수 ${evens}개로 짝수 안정형 조합입니다.`;

      return {
        reply: `📊 **번호 [${numbers.join(', ')}] 홀짝 & 총합 분석**\n\n• **홀수 / 짝수 비율**: ${odds} : ${evens} (${oddEvenDesc})\n• **번호의 총합**: ${sum}점 (역대 1등 당첨번호 통계상 가장 빈번한 120~160점 구간 대비 ${
          sum >= 120 && sum <= 160 ? '가장 균형 잡힌 최적 구간에 위치합니다!' : sum < 120 ? '다소 낮은 편으로 초반 번호 위주 구성입니다.' : '다소 높은 편으로 후반 번호 위주 구성입니다.'
        })`,
        followUps: ['구간별 분포 확인하기', '이 번호 저장하기', '새 번호로 재추첨하기'],
      };
    }

    if (query.includes('구간') || query.includes('분포') || query.includes('1~10')) {
      return {
        reply: `🌐 **구간별 분포 분석 (1~45)**\n\n• 1~10번대: ${range1}개\n• 11~20번대: ${range2}개\n• 21~30번대: ${range3}개\n• 31~40번대: ${range4}개\n• 41~45번대: ${range5}개\n\n특정 구간에만 치우치지 않고 골고루 퍼져 있을수록 당첨 확률의 분산 효과를 기대할 수 있습니다.`,
        followUps: ['연속 번호가 있나요?', '행운의 한 줄 평', '보관함에 저장하기'],
      };
    }

    if (query.includes('연속') || query.includes('동끝수')) {
      return {
        reply: `🔍 **연속 번호 & 패턴 분석**\n\n• **연속된 번호**: ${
          consecutivePairs.length > 0
            ? `발견되었습니다 (${consecutivePairs.join(', ')}). 실제 1등 당첨 조합의 약 50%에서도 1쌍의 연속번호가 자주 등장합니다.`
            : '연속된 번호가 없는 단독 번호 배치 조합입니다.'
        }\n• **첫 번호와 끝 번호 차이(AC지수 관련)**: ${numbers[5] - numbers[0]}의 폭으로 넓은 범위를 커버하고 있습니다.`,
        followUps: ['홀짝 비율과 총합 분석', '이 번호로 행운 메시지', '새 번호 뽑기'],
      };
    }

    if (query.includes('행운') || query.includes('덕담') || query.includes('메시지')) {
      return {
        reply: `🍀 **행운의 메시지**\n\n"당신이 마주한 숫자 [${numbers.join(', ')}]에는 긍정적인 기운이 깃들어 있습니다. 마음이 끌린다면 망설이지 말고 상단 '저장하기'를 눌러 보관해 보세요. 이번 주 좋은 소식이 당신 곁으로 찾아올 것입니다!" ✨`,
        followUps: ['보관함에 저장하기', '홀짝 통계 다시보기', '다른 번호 뽑기'],
      };
    }

    if (query.includes('저장')) {
      if (onSaveCombination) {
        onSaveCombination();
      }
      return {
        reply: `✅ 번호 조합 **[${numbers.join(', ')}]** 저장을 처리했습니다! 언제든지 상단 '보관함' 탭에서 다시 열람하고 관리하실 수 있습니다.`,
        followUps: ['보관함 바로가기', '새 번호 또 뽑기'],
      };
    }

    // Default friendly response
    return {
      reply: `답변해 드릴게요! 현재 선택된 번호 조합 [${numbers.join(', ')}]은 총합 ${sum}에 홀짝 ${odds}:${evens} 구조를 지니고 있습니다. 이 조합에 대해 더 구체적인 질문(통계, 번호대 분포, 연속번호 유무 등)이 있으시면 언제든 편하게 물어보세요!`,
      followUps: ['홀짝 비율 분석', '구간별 분포 확인', '행운 메시지 받기'],
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: Date.now(),
      status: 'delivered',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    // Realistic typing delay
    setTimeout(() => {
      if (simulateError) {
        // Simulated error state
        const errorMsg: ChatMessage = {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          text: '일시적인 네트워크 지연으로 분석 답변을 불러오지 못했습니다.',
          timestamp: Date.now(),
          status: 'error',
          suggestedFollowUps: ['다시 시도하기'],
        };
        setMessages((prev) => [...prev, errorMsg]);
        setIsLoading(false);
        return;
      }

      const { reply, followUps } = generateSimulatedResponse(text, contextNumbers);
      const assistantMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: Date.now(),
        status: 'delivered',
        contextNumbers: [...contextNumbers],
        suggestedFollowUps: followUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 650);
  };

  const handleRetry = () => {
    setSimulateError(false);
    handleSendMessage('이 조합의 홀짝 비율과 총합 분석');
  };

  return (
    <div
      className={`w-full rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {/* Header bar */}
      <div className="bg-[#eff4ff] px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-sm">chat</span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
              <span>AI 번호 조합 분석</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-md">
                Active Context
              </span>
            </h3>
          </div>
        </div>

        {/* Error Simulation Toggle (For developer testing UI states per PRD) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSimulateError(!simulateError)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              simulateError
                ? 'bg-rose-100 text-rose-700 border-rose-300 font-bold'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
            title="오류 상태 UI 테스트 모드"
          >
            {simulateError ? '⚠️ 오류 테스트 ON' : '오류 테스트'}
          </button>
        </div>
      </div>

      {/* Context Badge Banner */}
      <div className="bg-[#f8f9ff] px-4 py-1.5 border-b border-slate-100 flex items-center gap-1 text-[11px] text-slate-500 overflow-x-auto">
        <span className="material-symbols-outlined text-[14px] text-[#2563eb] flex-shrink-0">
          radar
        </span>
        <span className="font-semibold text-slate-700 flex-shrink-0">분석 대상:</span>
        <span className="font-mono font-bold text-[#2563eb] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
          {contextNumbers.join(' · ')}
        </span>
      </div>

      {/* Conversation Area */}
      <div className="p-3.5 max-h-[300px] min-h-[170px] overflow-y-auto space-y-3 text-xs sm:text-[13px] scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isError = msg.status === 'error';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#2563eb] text-white rounded-tr-none'
                    : isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                    : 'bg-[#f1f5f9] text-[#0b1c30] rounded-tl-none border border-slate-200/50'
                }`}
              >
                {msg.text}

                {/* Error Retry Button */}
                {isError && (
                  <div className="mt-2 pt-2 border-t border-rose-200/70 flex justify-end">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white font-semibold text-[11px] rounded-lg hover:bg-rose-700 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[13px]">refresh</span>
                      다시 시도
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Suggestion Chips if available */}
              {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                  {msg.suggestedFollowUps.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-[#004ac6] border border-blue-200/60 hover:bg-blue-100 hover:border-blue-300 transition-colors font-medium active:scale-95 text-left"
                    >
                      <span>💬</span>
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-[#f1f5f9] text-slate-500 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs flex items-center gap-1.5 border border-slate-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-[11px] font-medium text-slate-600">
                번호 조합 분석 중...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="현재 번호 조합에 대해 물어보세요... (예: 홀짝, 총합)"
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-[13px] text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-8 h-8 rounded-xl bg-[#2563eb] disabled:bg-slate-300 text-white flex items-center justify-center transition-all hover:bg-blue-700 active:scale-95 flex-shrink-0 shadow-sm"
          title="질문 전송"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
};
