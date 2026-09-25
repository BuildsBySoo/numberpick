import React from 'react';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isRolling?: boolean;
}

export function getBallRangeClass(n: number): string {
  if (n <= 10) return 'ball-range-1'; // Gold / Yellow
  if (n <= 20) return 'ball-range-2'; // Blue
  if (n <= 30) return 'ball-range-3'; // Red
  if (n <= 40) return 'ball-range-4'; // Purple
  return 'ball-range-5'; // Green
}

export const LottoBall: React.FC<LottoBallProps> = ({
  number,
  size = 'md',
  className = '',
  isRolling = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-11 h-11 text-base sm:w-12 sm:h-12 sm:text-lg',
    lg: 'w-12 h-12 text-lg sm:w-14 sm:h-14 sm:text-xl',
    xl: 'w-14 h-14 text-xl sm:w-16 sm:h-16 sm:text-2xl',
  }[size];

  const rangeClass = getBallRangeClass(number);

  return (
    <div
      className={`lotto-ball ${rangeClass} ${sizeClasses} ${
        isRolling ? 'animate-bounce duration-300' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      title={`번호 ${number}`}
    >
      <span className="relative z-10 font-black tracking-tight">{number}</span>
    </div>
  );
};
