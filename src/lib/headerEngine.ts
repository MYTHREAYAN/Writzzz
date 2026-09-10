import {
  HeaderSettings,
  HeaderStyle,
  HeaderPosition,
  HeaderDensity,
  DateFormat,
  PageNumberFormat,
  Assignment,
} from '../types';

export const HEADER_PRESETS: Record<
  string,
  {
    name: string;
    description: string;
    style: HeaderStyle;
    position: HeaderPosition;
    density: HeaderDensity;
    enabledFields: Array<
      | 'subject'
      | 'assignmentTitle'
      | 'studentName'
      | 'rollNumber'
      | 'registerNumber'
      | 'date'
      | 'collegeName'
      | 'department'
      | 'semester'
      | 'subjectCode'
      | 'pageNumber'
    >;
  }
> = {
  academic: {
    name: 'Academic Assignment',
    description: 'Subject, Title, Student Name, Roll No, Date, Page Number',
    style: 'academic',
    position: 'split',
    density: 'compact',
    enabledFields: ['subject', 'assignmentTitle', 'studentName', 'rollNumber', 'date', 'pageNumber'],
  },
  minimal: {
    name: 'Minimal',
    description: 'Subject + Page Number only. Clean & space-efficient',
    style: 'minimal',
    position: 'split',
    density: 'compact',
    enabledFields: ['subject', 'pageNumber'],
  },
  notebook: {
    name: 'Notebook',
    description: 'Name, Roll No, Date & Page Number in student notebook style',
    style: 'notebook',
    position: 'top-right',
    density: 'compact',
    enabledFields: ['studentName', 'rollNumber', 'date', 'pageNumber'],
  },
  titleOnly: {
    name: 'Title Only',
    description: 'Assignment Title only centered at top',
    style: 'minimal',
    position: 'top-center',
    density: 'compact',
    enabledFields: ['assignmentTitle'],
  },
  none: {
    name: 'None',
    description: 'No header at all. Assignment starts directly with question 1',
    style: 'none',
    position: 'split',
    density: 'compact',
    enabledFields: [],
  },
};

export function getDefaultDateString(format: DateFormat = 'DD-MM-YYYY'): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MM-YYYY':
    default:
      return `${day}-${month}-${year}`;
  }
}

export function formatDate(val: string | undefined, format: DateFormat = 'DD-MM-YYYY'): string {
  if (!val || !val.trim()) {
    return getDefaultDateString(format);
  }

  // If user entered raw YYYY-MM-DD or date object
  const dateObj = new Date(val);
  if (!isNaN(dateObj.getTime()) && val.includes('-') && val.length === 10) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD-MM-YYYY':
      default:
        return `${day}-${month}-${year}`;
    }
  }

  return val;
}

export function formatPageNumber(page: number, totalPages: number, format: PageNumberFormat = 'Page 1'): string {
  switch (format) {
    case '1':
      return `${page}`;
    case 'Page 1 of 5':
      return `Page ${page} of ${Math.max(page, totalPages)}`;
    case 'Page 1':
    default:
      return `Page ${page}`;
  }
}

export function getDefaultHeaderSettings(assignment?: Partial<Assignment>): HeaderSettings {
  return {
    enabled: true,
    style: 'academic',
    position: 'split',
    density: 'compact',
    handwrittenFields: false,
    firstPageOnly: false,
    fields: {
      subject: {
        enabled: true,
        value: assignment?.subject || 'Assignment',
      },
      assignmentTitle: {
        enabled: true,
        value: assignment?.title || 'Unit Assignment',
      },
      studentName: {
        enabled: !!assignment?.studentName,
        value: assignment?.studentName || '',
      },
      rollNumber: {
        enabled: !!assignment?.rollNumber,
        value: assignment?.rollNumber || '',
      },
      registerNumber: {
        enabled: false,
        value: '',
      },
      date: {
        enabled: !!assignment?.submissionDate,
        value: assignment?.submissionDate || getDefaultDateString('DD-MM-YYYY'),
        format: 'DD-MM-YYYY',
      },
      collegeName: {
        enabled: !!assignment?.institution,
        value: assignment?.institution || '',
      },
      department: {
        enabled: false,
        value: '',
      },
      year: {
        enabled: false,
        value: '',
      },
      semester: {
        enabled: false,
        value: '',
      },
      subjectCode: {
        enabled: false,
        value: '',
      },
      pageNumber: {
        enabled: true,
        position: 'top-right',
        format: 'Page 1',
      },
    },
    customFields: [],
  };
}

export function calculateHeaderDimensions(headerSettings?: HeaderSettings): {
  headerHeightPx: number;
  marginTopPx: number;
  contentTopOffsetPx: number;
  isHeaderRendered: boolean;
  hasTopPageNumber: boolean;
  hasBottomPageNumber: boolean;
} {
  if (!headerSettings || !headerSettings.enabled || headerSettings.style === 'none') {
    return {
      headerHeightPx: 0,
      marginTopPx: 38,
      contentTopOffsetPx: 25,
      isHeaderRendered: false,
      hasTopPageNumber: false,
      hasBottomPageNumber:
        headerSettings?.fields?.pageNumber?.enabled &&
        headerSettings.fields.pageNumber.position.startsWith('bottom'),
    };
  }

  // Count active fields (excluding pageNumber if positioned bottom)
  let activeFieldCount = 0;
  const f = headerSettings.fields;

  if (f.subject?.enabled && f.subject.value) activeFieldCount++;
  if (f.assignmentTitle?.enabled && f.assignmentTitle.value) activeFieldCount++;
  if (f.studentName?.enabled && f.studentName.value) activeFieldCount++;
  if (f.rollNumber?.enabled && f.rollNumber.value) activeFieldCount++;
  if (f.registerNumber?.enabled && f.registerNumber.value) activeFieldCount++;
  if (f.date?.enabled && f.date.value) activeFieldCount++;
  if (f.collegeName?.enabled && f.collegeName.value) activeFieldCount++;
  if (f.department?.enabled && f.department.value) activeFieldCount++;
  if (f.year?.enabled && f.year.value) activeFieldCount++;
  if (f.semester?.enabled && f.semester.value) activeFieldCount++;
  if (f.subjectCode?.enabled && f.subjectCode.value) activeFieldCount++;

  const activeCustomCount = (headerSettings.customFields || []).filter(
    (c) => c.enabled && c.label && c.value
  ).length;
  activeFieldCount += activeCustomCount;

  const pageNumEnabled = f.pageNumber?.enabled;
  const pageNumTop = pageNumEnabled && f.pageNumber.position.startsWith('top');
  const pageNumBottom = pageNumEnabled && f.pageNumber.position.startsWith('bottom');

  if (pageNumTop) {
    activeFieldCount++;
  }

  // If no fields are enabled at all, don't waste space!
  if (activeFieldCount === 0) {
    return {
      headerHeightPx: 0,
      marginTopPx: 38,
      contentTopOffsetPx: 25,
      isHeaderRendered: false,
      hasTopPageNumber: false,
      hasBottomPageNumber: pageNumBottom,
    };
  }

  // Multipliers based on density
  let baseHeight = 36;
  let densityPadding = 12;

  if (headerSettings.density === 'compact') {
    densityPadding = 8;
  } else if (headerSettings.density === 'spacious') {
    densityPadding = 20;
  }

  // Adjust for number of fields and position layout
  if (headerSettings.position === 'full-width' || activeFieldCount > 4) {
    baseHeight = 60;
  } else if (activeFieldCount <= 2) {
    baseHeight = 28;
  } else {
    baseHeight = 44;
  }

  const totalHeight = baseHeight + densityPadding * 2;
  const marginTop = Math.max(50, totalHeight + 20);

  return {
    headerHeightPx: totalHeight,
    marginTopPx: marginTop,
    contentTopOffsetPx: totalHeight + 10,
    isHeaderRendered: true,
    hasTopPageNumber: pageNumTop,
    hasBottomPageNumber: pageNumBottom,
  };
}

export function applyPreset(
  presetKey: keyof typeof HEADER_PRESETS,
  currentSettings: HeaderSettings,
  assignment?: Partial<Assignment>
): HeaderSettings {
  const preset = HEADER_PRESETS[presetKey];
  if (!preset) return currentSettings;

  const newFields = { ...currentSettings.fields };

  // Set all to false first
  (Object.keys(newFields) as Array<keyof typeof newFields>).forEach((key) => {
    if (key === 'pageNumber') {
      newFields.pageNumber = {
        ...newFields.pageNumber,
        enabled: preset.enabledFields.includes('pageNumber'),
      };
    } else if (newFields[key]) {
      newFields[key] = {
        ...newFields[key],
        enabled: preset.enabledFields.includes(key as any),
      };
    }
  });

  return {
    ...currentSettings,
    enabled: preset.style !== 'none',
    style: preset.style,
    position: preset.position,
    density: preset.density,
    fields: newFields,
  };
}
