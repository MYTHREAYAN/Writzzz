import React, { forwardRef, useMemo } from 'react';
import { PageContent, HandwritingStyle, HeaderSettings, SheetStyle } from '../types';
import { SheetPaperBackground } from './SheetPaperBackground';
import { AssignmentHeaderRenderer } from './AssignmentHeaderRenderer';
import { PageNumberRenderer } from './PageNumberRenderer';
import { RealisticHandwrittenText } from './RealisticHandwrittenText';
import { calculateHeaderDimensions } from '../lib/headerEngine';

export interface HandwrittenA4PageProps {
  page: PageContent;
  style: HandwritingStyle;
  headerSettings: HeaderSettings;
  totalPages: number;
  isFirstPage?: boolean;
  className?: string;
  id?: string;
  styleOverrides?: React.CSSProperties;
}

export const HandwrittenA4Page = forwardRef<HTMLDivElement, HandwrittenA4PageProps>(
  (
    {
      page,
      style,
      headerSettings,
      totalPages,
      isFirstPage = false,
      className = '',
      id,
      styleOverrides = {},
    },
    ref
  ) => {
    const sheetStyle: SheetStyle =
      style.sheetStyle ||
      (style.paperType === 'blank'
        ? 'plain-white'
        : style.paperType === 'graph'
        ? 'graph'
        : 'single-rule');

    const headerDims = useMemo(() => {
      return calculateHeaderDimensions(headerSettings);
    }, [headerSettings]);

    return (
      <div
        ref={ref}
        id={id}
        data-page-number={page.pageNumber}
        className={`relative w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] text-neutral-900 overflow-hidden select-none bg-white ${className}`}
        style={{
          width: '794px',
          height: '1123px',
          minHeight: '1123px',
          maxHeight: '1123px',
          boxSizing: 'border-box',
          ...styleOverrides,
        }}
      >
        {/* 1. SEPARATED PAPER BACKGROUND + TEMPLATE LAYER */}
        <SheetPaperBackground
          sheetStyle={sheetStyle}
          lineSpacing={style.lineSpacing || 32}
          width={794}
          height={1123}
          marginTop={headerDims.isHeaderRendered ? headerDims.marginTopPx : 36}
          marginLeft={64}
        />

        {/* 2. OPTIONAL & FULLY CONFIGURABLE ASSIGNMENT HEADER */}
        <AssignmentHeaderRenderer
          headerSettings={headerSettings}
          style={style}
          currentPage={page.pageNumber}
          totalPages={totalPages}
          isFirstPage={isFirstPage}
        />

        {/* 3. INDEPENDENT BOTTOM PAGE NUMBER */}
        <PageNumberRenderer
          pageNumberConfig={headerSettings.fields?.pageNumber}
          currentPage={page.pageNumber}
          totalPages={totalPages}
        />

        {/* 4. HANDWRITING CONTENT LAYER */}
        <div
          className={`relative px-10 space-y-4 z-10 ${
            headerDims.isHeaderRendered ? 'pt-3' : 'pt-5'
          }`}
        >
          {page.items.map((item, idx) => {
            if (item.type === 'question') {
              return (
                <div key={idx} className="relative flex items-start pt-2">
                  {/* Question Number in Left Margin Column */}
                  <div className="w-[54px] pr-2 text-right font-bold text-sm shrink-0 select-none">
                    <RealisticHandwrittenText
                      text={`Q${item.qNum}.`}
                      style={style}
                      lineIndex={idx}
                      className="font-bold"
                    />
                  </div>

                  {/* Question Text */}
                  <div className="pl-5 flex-1">
                    <RealisticHandwrittenText
                      text={item.text || ''}
                      style={{
                        ...style,
                        fontSize: (style.fontSize || 18) + 1,
                      }}
                      lineIndex={idx}
                      className="font-bold"
                    />
                  </div>
                </div>
              );
            }

            if (item.type === 'paragraph') {
              return (
                <div key={idx} className="relative flex items-start">
                  {/* Left Margin spacer */}
                  <div className="w-[54px] shrink-0" />
                  {/* Paragraph Text with realistic glyph transforms */}
                  <div className="pl-5 flex-1 select-text">
                    <RealisticHandwrittenText
                      text={item.text || ''}
                      style={style}
                      lineIndex={idx}
                    />
                  </div>
                </div>
              );
            }

            if (item.type === 'diagram') {
              return (
                <div key={idx} className="relative flex items-center justify-center my-3">
                  <div className="w-[54px] shrink-0" />
                  <div className="pl-5 flex flex-col items-center">
                    <div
                      className="bg-white/95 p-3 rounded-lg border border-neutral-300 shadow-sm max-w-md w-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: item.diagram.data }}
                    />
                    {item.diagram.caption && (
                      <p className="text-xs mt-1.5 text-center font-medium">
                        <RealisticHandwrittenText
                          text={item.diagram.caption}
                          style={style}
                          lineIndex={idx}
                        />
                      </p>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  }
);

HandwrittenA4Page.displayName = 'HandwrittenA4Page';
