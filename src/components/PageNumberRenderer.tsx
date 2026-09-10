import React from 'react';
import { HeaderPageNumberFieldItem } from '../types';
import { formatPageNumber } from '../lib/headerEngine';

interface PageNumberRendererProps {
  pageNumberConfig?: HeaderPageNumberFieldItem;
  currentPage: number;
  totalPages: number;
}

export const PageNumberRenderer: React.FC<PageNumberRendererProps> = ({
  pageNumberConfig,
  currentPage,
  totalPages,
}) => {
  if (!pageNumberConfig || !pageNumberConfig.enabled) {
    return null;
  }

  // Only render bottom positions here (top positions are rendered by HeaderRenderer or top bar)
  if (!pageNumberConfig.position.startsWith('bottom')) {
    return null;
  }

  const text = formatPageNumber(currentPage, totalPages, pageNumberConfig.format);

  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-5 right-10 text-right',
    'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2 text-center',
    'bottom-left': 'bottom-5 left-10 text-left',
  };

  const posClass = positionClasses[pageNumberConfig.position] || positionClasses['bottom-right'];

  return (
    <div
      id={`page-number-${currentPage}`}
      className={`absolute ${posClass} font-mono text-xs font-medium text-neutral-500/90 select-none z-20 pointer-events-none`}
    >
      <span className="px-2 py-0.5 rounded bg-white/70 border border-neutral-300/60 shadow-2xs backdrop-blur-xs">
        {text}
      </span>
    </div>
  );
};
