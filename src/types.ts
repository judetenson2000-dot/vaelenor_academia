export interface BoundResearch {
  id: string;
  title: string;
  snippet: string;
  url: string;
  pageId?: number;
  addedAt: string;
  citationKey: string;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  baseline?: number;
  predicted?: number;
}

export interface GraphCalculation {
  enabled: boolean;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  caption: string;
  chartType: 'line' | 'bar' | 'area';
  inputMode: 'values' | 'formula' | 'preset';
  valuesInput: string;
  formulaInput: string;
  presetKey: string;
  color: string;
  data: ChartDataPoint[];
}

export interface AcademicEquation {
  id: string;
  latex: string;
  label: string;
  explanation?: string;
  equationNumber: number;
}

export interface PaperData {
  title: string;
  author: string;
  affiliation: string;
  studentId: string;
  email: string;
  publicationTag: string;
  date: string;
  keywords: string;
  abstract: string;
  keyModules: string;
  modulesList: { name: string; description: string; tech: string }[];
  boundResearch: BoundResearch[];
  equations?: AcademicEquation[];
  graph: GraphCalculation;
  acknowledgments: string;
}

export type AdvisorRole = 'mentor' | 'proofreader' | 'critic' | 'methodologist';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  note: string;
  fallbackUrl: string;
  lastUpdated?: string;
}

