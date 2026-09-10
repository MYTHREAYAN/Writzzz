import React from 'react';
import { HeaderSettings, HandwritingStyle } from '../types';
import { formatDate, formatPageNumber } from '../lib/headerEngine';
import { getFontFamilyClass, getFontFamilyCss, getInkClass } from '../lib/handwritingEngine';

interface AssignmentHeaderRendererProps {
  headerSettings: HeaderSettings;
  style: HandwritingStyle;
  currentPage: number;
  totalPages: number;
  isFirstPage?: boolean;
}

export const AssignmentHeaderRenderer: React.FC<AssignmentHeaderRendererProps> = ({
  headerSettings,
  style,
  currentPage,
  totalPages,
  isFirstPage = true,
}) => {
  if (!headerSettings || !headerSettings.enabled || headerSettings.style === 'none') {
    return null;
  }

  // If firstPageOnly is true and this is not the first page, we don't render the main header
  if (headerSettings.firstPageOnly && !isFirstPage) {
    return null;
  }

  const { style: headerStyle, position, density, fields, customFields, handwrittenFields } = headerSettings;

  // Density vertical & horizontal spacing
  const densityStyles = {
    compact: 'py-2 px-10 gap-2',
    normal: 'py-3.5 px-10 gap-3',
    spacious: 'py-5 px-10 gap-4',
  }[density || 'compact'];

  // Handwriting value style class
  const hwFontClass = handwrittenFields ? getFontFamilyClass(style.fontFamily) : '';
  const hwInkClass = handwrittenFields ? getInkClass(style.inkType, style.blueInkNuance) : 'text-neutral-900';

  // Gather active fields
  const activeItems: Array<{ key: string; label: string; value: string; isTitle?: boolean }> = [];

  if (fields.subject?.enabled && fields.subject.value) {
    activeItems.push({ key: 'subject', label: 'Subject', value: fields.subject.value });
  }
  if (fields.subjectCode?.enabled && fields.subjectCode.value) {
    activeItems.push({ key: 'subjectCode', label: 'Code', value: fields.subjectCode.value });
  }
  if (fields.assignmentTitle?.enabled && fields.assignmentTitle.value) {
    activeItems.push({ key: 'assignmentTitle', label: 'Assignment', value: fields.assignmentTitle.value, isTitle: true });
  }
  if (fields.collegeName?.enabled && fields.collegeName.value) {
    activeItems.push({ key: 'collegeName', label: 'Institution', value: fields.collegeName.value });
  }
  if (fields.department?.enabled && fields.department.value) {
    activeItems.push({ key: 'department', label: 'Dept', value: fields.department.value });
  }
  if (fields.semester?.enabled && fields.semester.value) {
    activeItems.push({ key: 'semester', label: 'Sem', value: fields.semester.value });
  }
  if (fields.year?.enabled && fields.year.value) {
    activeItems.push({ key: 'year', label: 'Year', value: fields.year.value });
  }
  if (fields.studentName?.enabled && fields.studentName.value) {
    activeItems.push({ key: 'studentName', label: 'Name', value: fields.studentName.value });
  }
  if (fields.rollNumber?.enabled && fields.rollNumber.value) {
    activeItems.push({ key: 'rollNumber', label: 'Roll No', value: fields.rollNumber.value });
  }
  if (fields.registerNumber?.enabled && fields.registerNumber.value) {
    activeItems.push({ key: 'registerNumber', label: 'Reg No', value: fields.registerNumber.value });
  }
  if (fields.date?.enabled && fields.date.value) {
    const formattedDate = formatDate(fields.date.value, fields.date.format || 'DD-MM-YYYY');
    activeItems.push({ key: 'date', label: 'Date', value: formattedDate });
  }

  // Active custom fields
  (customFields || []).forEach((cf) => {
    if (cf.enabled && cf.label && cf.value) {
      activeItems.push({ key: cf.id, label: cf.label, value: cf.value });
    }
  });

  // Top page number
  const showTopPageNum = fields.pageNumber?.enabled && fields.pageNumber.position.startsWith('top');
  const pageNumText = showTopPageNum
    ? formatPageNumber(currentPage, totalPages, fields.pageNumber.format)
    : null;

  if (activeItems.length === 0 && !showTopPageNum) {
    return null;
  }

  // Border & Accent styling per Header Style
  const borderStyles: Record<string, string> = {
    minimal: 'border-b border-neutral-300/70',
    classic: 'border-b-2 border-neutral-700/80 pb-3 border-double',
    academic: 'border-b-2 border-indigo-700/30 bg-neutral-50/40 pb-2.5',
    notebook: 'border-b-2 border-rose-300/80 pb-2.5',
    custom: 'border border-neutral-300/90 rounded-md bg-white/60 mx-8 p-3 shadow-xs',
  };

  const currentBorderStyle = borderStyles[headerStyle] || borderStyles.academic;

  // Partition items for Split Position
  const leftItems = activeItems.filter((item) =>
    ['subject', 'assignmentTitle', 'collegeName', 'department', 'subjectCode'].includes(item.key)
  );
  const rightItems = activeItems.filter(
    (item) => !['subject', 'assignmentTitle', 'collegeName', 'department', 'subjectCode'].includes(item.key)
  );

  return (
    <header
      id="a4-assignment-header"
      className={`relative z-10 w-full transition-all select-none ${densityStyles} ${currentBorderStyle}`}
    >
      {/* 1. SPLIT LEFT / RIGHT LAYOUT */}
      {position === 'split' && (
        <div className="flex items-start justify-between gap-4">
          {/* Left Column: Subject, Title, Institution */}
          <div className="flex flex-col gap-1 max-w-[55%]">
            {leftItems.map((item) => (
              <div key={item.key} className="flex items-baseline gap-1.5 text-xs text-neutral-700">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                  {item.label}:
                </span>
                <span
                  className={`${item.isTitle ? 'font-bold text-sm text-neutral-900' : 'font-medium'} ${
                    handwrittenFields ? `${hwFontClass} ${hwInkClass} text-sm` : 'text-neutral-800'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
            {leftItems.length === 0 && activeItems.slice(0, 2).map((item) => (
              <div key={item.key} className="flex items-baseline gap-1.5 text-xs text-neutral-700">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{item.label}:</span>
                <span className={`font-medium ${handwrittenFields ? `${hwFontClass} ${hwInkClass} text-sm` : 'text-neutral-800'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Right Column: Student Details, Date, Page Number */}
          <div className="flex flex-col items-end gap-1 max-w-[45%] text-right font-mono text-[11px] text-neutral-600">
            {rightItems.map((item) => (
              <div key={item.key} className="flex items-baseline gap-1.5">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{item.label}:</span>
                <span className={`font-semibold ${handwrittenFields ? `${hwFontClass} ${hwInkClass} text-sm` : 'text-neutral-900'}`}>
                  {item.value}
                </span>
              </div>
            ))}
            {showTopPageNum && pageNumText && (
              <div className="mt-0.5 inline-flex items-center px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10.5px] font-semibold">
                {pageNumText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. TOP CENTER LAYOUT */}
      {position === 'top-center' && (
        <div className="flex flex-col items-center text-center gap-1.5">
          {activeItems.map((item) => (
            <div key={item.key} className="flex items-baseline gap-1.5">
              <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{item.label}:</span>
              <span
                className={`${item.isTitle ? 'font-bold text-sm text-neutral-900' : 'font-medium'} ${
                  handwrittenFields ? `${hwFontClass} ${hwInkClass} text-sm` : 'text-neutral-800'
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
          {showTopPageNum && pageNumText && (
            <div className="mt-1 px-2.5 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10.5px] font-mono font-semibold">
              {pageNumText}
            </div>
          )}
        </div>
      )}

      {/* 3. TOP LEFT LAYOUT */}
      {position === 'top-left' && (
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1 max-w-[80%]">
            {activeItems.map((item) => (
              <div key={item.key} className="flex items-baseline gap-1.5 text-xs">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{item.label}:</span>
                <span
                  className={`${item.isTitle ? 'font-bold text-sm text-neutral-900' : 'font-medium'} ${
                    handwrittenFields ? `${hwFontClass} ${hwInkClass} text-sm` : 'text-neutral-800'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          {showTopPageNum && pageNumText && (
            <div className="font-mono text-[11px] font-semibold text-neutral-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
              {pageNumText}
            </div>
          )}
        </div>
      )}

      {/* 4. TOP RIGHT LAYOUT */}
      {position === 'top-right' && (
        <div className="flex justify-end">
          <div className="flex flex-col items-end gap-1 max-w-[80%] text-right font-mono text-[11px]">
            {activeItems.map((item) => (
              <div key={item.key} className="flex items-baseline gap-1.5">
                <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{item.label}:</span>
                <span
                  className={`${item.isTitle ? 'font-bold text-sm text-neutral-900' : 'font-semibold'} ${
                    handwrittenFields ? `${hwFontClass} ${hwInkClass} text-sm` : 'text-neutral-900'
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
            {showTopPageNum && pageNumText && (
              <div className="mt-1 px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10.5px] font-semibold">
                {pageNumText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. FULL WIDTH GRID LAYOUT */}
      {position === 'full-width' && (
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {fields.subject?.enabled && fields.subject.value && (
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  {fields.subject.value}
                </span>
              )}
              {fields.assignmentTitle?.enabled && fields.assignmentTitle.value && (
                <span className="text-xs font-semibold text-neutral-700">
                  • {fields.assignmentTitle.value}
                </span>
              )}
            </div>
            {showTopPageNum && pageNumText && (
              <span className="font-mono text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                {pageNumText}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 border-t border-neutral-200 text-[11px]">
            {activeItems
              .filter((i) => !['subject', 'assignmentTitle'].includes(i.key))
              .map((item) => (
                <div key={item.key} className="flex items-baseline gap-1 overflow-hidden truncate">
                  <span className="font-medium text-neutral-500 text-[10px] uppercase">{item.label}:</span>
                  <span className={`font-semibold truncate ${handwrittenFields ? `${hwFontClass} ${hwInkClass}` : 'text-neutral-800'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  );
};
