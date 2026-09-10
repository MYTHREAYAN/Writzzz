export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  createdAt: string;
}

export type HandwritingFont =
  | 'Caveat'
  | 'Kalam'
  | 'Homemade Apple'
  | 'Cedarville Cursive'
  | 'Indie Flower'
  | 'Architects Daughter'
  | 'Shadows Into Light';
export type InkType =
  | 'ballpoint-blue'
  | 'ballpoint-black'
  | 'gel-blue'
  | 'gel-black'
  | 'fountain-blue'
  | 'royal-blue'
  | 'dark-blue';
export type PaperType = 'ruled' | 'blank' | 'graph';

export type SheetStyle =
  | 'plain-white'
  | 'single-rule'
  | 'double-rule'
  | 'college-rule'
  | 'narrow-rule'
  | 'wide-rule'
  | 'graph'
  | 'dotted'
  | 'blank-margin'
  | 'custom-minimal';

export type BlueInkNuance =
  | 'natural-ballpoint'
  | 'deep-navy'
  | 'royal-blue'
  | 'medium-blue'
  | 'dark-blue'
  | 'light-blue'
  | 'blue-gray'
  | 'fountain-pen'
  | 'vibrant-gel';

export interface HandwritingStyle {
  _id?: string;
  id?: string;
  userId?: string;
  profileName: string;
  fontFamily: HandwritingFont;
  slant: number; // -10 to 10 deg
  fontSize: number; // px
  lineSpacing: number; // px
  letterSpacing: number; // px
  wordSpacing: number; // px
  jitter: number; // 0 to 4 px
  inkType: InkType;
  paperType?: PaperType; // backwards compatibility
  sheetStyle: SheetStyle; // 10 distinct sheet templates
  blueInkNuance?: BlueInkNuance;
  penPressure: number; // 0.8 to 1.3
  marginTop?: number; // px
  marginLeft?: number; // px
  marginRight?: number; // px
  marginBottom?: number; // px
  sampleImageUrl?: string;
  glyphVariationLevel?: number; // 0 to 2
  baselineWander?: number; // 0 to 3
  sampleExtractedTraits?: {
    xHeightRatio?: number;
    ascenderRatio?: number;
    descenderRatio?: number;
    detectedSlant?: number;
    strokeFluctuation?: number;
    glyphNotes?: string[];
  };
  createdAt?: string;
}

export interface DiagramItem {
  id: string;
  title: string;
  type: 'flowchart' | 'circuit' | 'chart' | 'sketch' | 'svg';
  data: string; // SVG or base64 image
  caption?: string;
}

export interface AnswerItem {
  id: string;
  questionNumber: string | number;
  questionText: string;
  marks?: number;
  requiredPages?: number;
  answerText: string;
  diagram?: DiagramItem;
  pageBreakBefore?: boolean;
}

export interface QuestionInput {
  id?: string;
  questionNumber: string | number;
  questionText: string;
  marks?: number;
  requiredPages: number;
}

export type HeaderStyle = 'minimal' | 'classic' | 'academic' | 'notebook' | 'custom' | 'none';
export type HeaderPosition = 'top-left' | 'top-center' | 'top-right' | 'split' | 'full-width';
export type HeaderDensity = 'compact' | 'normal' | 'spacious';
export type PageNumberPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' | 'bottom-left';
export type PageNumberFormat = 'Page 1' | '1' | 'Page 1 of 5';
export type DateFormat = 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface HeaderCustomField {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
}

export interface HeaderFieldItem {
  enabled: boolean;
  value: string;
}

export interface HeaderDateFieldItem extends HeaderFieldItem {
  format?: DateFormat;
}

export interface HeaderPageNumberFieldItem {
  enabled: boolean;
  position: PageNumberPosition;
  format: PageNumberFormat;
}

export interface HeaderFieldsConfig {
  subject: HeaderFieldItem;
  assignmentTitle: HeaderFieldItem;
  studentName: HeaderFieldItem;
  rollNumber: HeaderFieldItem;
  registerNumber: HeaderFieldItem;
  date: HeaderDateFieldItem;
  collegeName: HeaderFieldItem;
  department: HeaderFieldItem;
  year?: HeaderFieldItem;
  semester: HeaderFieldItem;
  subjectCode: HeaderFieldItem;
  pageNumber: HeaderPageNumberFieldItem;
}

export interface HeaderSettings {
  enabled: boolean;
  style: HeaderStyle;
  position: HeaderPosition;
  density: HeaderDensity;
  handwrittenFields?: boolean; // Render values with handwriting font
  firstPageOnly?: boolean; // Show full header only on first page
  fields: HeaderFieldsConfig;
  customFields: HeaderCustomField[];
}

export interface Assignment {
  _id: string;
  id?: string;
  userId: string;
  title: string;
  subject: string;
  studentName?: string;
  rollNumber?: string;
  institution?: string;
  submissionDate?: string;
  answers: AnswerItem[];
  style: HandwritingStyle;
  headerSettings?: HeaderSettings;
  totalPages?: number;
  showMarks?: boolean;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  _id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PageItem {
  type: 'question' | 'paragraph' | 'heading' | 'diagram';
  qNum?: string | number;
  text?: string;
  diagram?: any;
  marks?: number;
  requiredPages?: number;
  isHeading?: boolean;
}

export interface PageContent {
  pageNumber: number;
  items: PageItem[];
}

export interface GeminiAnalysisResult {
  fontFamily: HandwritingFont;
  slant: number;
  penPressure: number;
  letterSpacing: number;
  lineSpacing: number;
  inkType: InkType;
  wordSpacing?: number;
  sheetStyle?: SheetStyle;
  blueInkNuance?: BlueInkNuance;
  glyphVariationLevel?: number;
  baselineWander?: number;
  characteristics: string[];
  summary: string;
  extractedTraits?: {
    xHeightRatio?: number;
    ascenderRatio?: number;
    descenderRatio?: number;
    detectedSlant?: number;
    strokeFluctuation?: number;
    glyphNotes?: string[];
  };
}
