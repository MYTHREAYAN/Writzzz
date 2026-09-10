import React, { useMemo } from 'react';
import { HandwritingStyle } from '../types';
import { computeGlyphTransform, getFontFamilyCss } from '../lib/handwritingEngine';

interface RealisticHandwrittenTextProps {
  text: string;
  style: HandwritingStyle;
  lineIndex?: number;
  className?: string;
  forceBlackInk?: boolean;
}

export const RealisticHandwrittenText: React.FC<RealisticHandwrittenTextProps> = ({
  text,
  style,
  lineIndex = 0,
  className = '',
  forceBlackInk = false,
}) => {
  const getFontFamilyClass = (f?: string) => {
    switch (f) {
      case 'Caveat':
        return 'font-caveat';
      case 'Kalam':
        return 'font-kalam';
      case 'Homemade Apple':
        return 'font-homemade';
      case 'Cedarville Cursive':
        return 'font-cursive';
      case 'Indie Flower':
        return 'font-indie';
      case 'Architects Daughter':
        return 'font-architects';
      case 'Shadows Into Light':
        return 'font-shadows';
      default:
        return 'font-caveat';
    }
  };

  // Split text into words to prevent unnatural breaking mid-word
  const words = useMemo(() => {
    return (text || '').split(' ');
  }, [text]);

  const fontClass = getFontFamilyClass(style.fontFamily);
  const baseLetterSpacing = style.letterSpacing ?? 0.5;
  const baseWordSpacing = style.wordSpacing ?? 4;

  let globalCharCount = 0;

  return (
    <span
      className={`inline ${fontClass} ${className} select-text`}
      style={{
        fontFamily: getFontFamilyCss(style.fontFamily),
        fontSize: `${style.fontSize || 18}px`,
        lineHeight: `${style.lineSpacing || 32}px`,
        transform: `skewX(${- (style.slant || 0)}deg)`,
        display: 'inline-block',
      }}
    >
      {words.map((word, wordIdx) => {
        const wordChars = word.split('');
        const renderedWord = (
          <span
            key={wordIdx}
            className="inline-block whitespace-nowrap"
            style={{ marginRight: `${baseWordSpacing}px` }}
          >
            {wordChars.map((char, charIdx) => {
              const transform = computeGlyphTransform(
                char,
                globalCharCount++,
                wordIdx,
                lineIndex,
                style,
                forceBlackInk
              );

              return (
                <span
                  key={charIdx}
                  className="inline-block"
                  style={{
                    color: transform.color,
                    transform: `translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotate}deg) scale(${transform.scale})`,
                    opacity: transform.opacity,
                    fontWeight: transform.fontWeight,
                    marginRight: `${baseLetterSpacing + transform.letterSpacingExtra}px`,
                    textShadow: `0 0 0.5px ${transform.color}40`,
                    transition: 'color 0.15s ease, transform 0.15s ease',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
        return renderedWord;
      })}
    </span>
  );
};
