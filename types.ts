
export enum QuestionType {
  SINGLE = 'Single Answer',
  MULTIPLE = 'Multiple Answer',
  NUMERIC = 'Numeric',
  PERCENTAGE = 'Percentage',
  RANKING = 'Ranking',
  GRID = 'Grid',
  OPEN_ENDED = 'Open-ended',
  NPS = 'NPS (Net Promoter Score)',
  SLIDER = 'Slider Scale',
  DATE = 'Date/Time',
  FILE_UPLOAD = 'File Upload',
  PAGE_BREAK = 'Page Break',
  // Advanced Types
  CONSTANT_SUM = 'Constant Sum',
  SIDE_BY_SIDE = 'Side-by-Side',
  DRILL_DOWN = 'Drill Down',
  HOT_SPOT = 'Hot Spot',
  HEAT_MAP = 'Heat Map',
  GRAPHIC_SLIDER = 'Graphic Slider',
}

export enum QuestionnaireStatus {
  DRAFT = 'Draft',
  REVIEW = 'In Review',
  APPROVED = 'Approved',
  LOCKED = 'Locked',
}

export enum CarryForwardMode {
  SELECTED = 'Selected Choices',
  UNSELECTED = 'Unselected Choices',
  DISPLAYED = 'Displayed Choices',
  NOT_DISPLAYED = 'Not Displayed Choices',
  ALL = 'All Choices',
}

export enum BlockMode {
  MUTUALLY_EXCLUSIVE = 'Mutually Exclusive',
  BLOCK_LIST = 'Block Specific Options',
}

export interface BlockOption {
  id: string;
  sourceChoice: string;
  mode: BlockMode;
  targets: string[]; 
}

export type LogicOperator = 
  | 'is_selected' 
  | 'is_not_selected' 
  | 'contains_any' 
  | 'contains_all' 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'between'
  | 'is_answered' 
  | 'is_not_answered';

export interface LogicCondition {
  id: string;
  sourceType: 'question' | 'variable' | 'quota';
  sourceQuestionId: string;
  operator: LogicOperator;
  value: string;
  secondValue?: string; 
}

export interface DisplayLogic {
  match: 'ALL' | 'ANY';
  conditions: LogicCondition[];
  inPage: boolean;
}

export interface CarryForwardConfig {
  sourceQuestionId: string;
  mode: CarryForwardMode;
}

export interface SkipRule {
  id: string;
  targetQuestionId: string | 'TERMINATE';
  conditions: LogicCondition[];
}

export interface RandomizationConfig {
  shuffleOptions: boolean;
  anchorLastN: number;
  anchorFirstN: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  interviewerNote?: string; 
  image?: string; 
  hasStimulus?: boolean;
  options?: string[];
  secondaryOptions?: string[]; 
  gridRows?: string[]; 
  optionRecodes?: string[]; 
  optionImages?: string[]; 
  hasOptionImages?: boolean;
  required: boolean;
  softValidation?: boolean; 
  randomized: boolean;
  randomizationConfig?: RandomizationConfig;
  displayLogic?: DisplayLogic;
  optionDisplayLogic?: Record<string, DisplayLogic>; 
  carryForward?: CarryForwardConfig;
  blockOptions?: BlockOption[]; 
  logic: LogicCondition[]; 
  skipLogic?: SkipRule[];
  validation?: {
    min?: number;
    max?: number;
    sumTo?: number; 
    charLimit?: number;
  };
}

export interface QuestionBlock {
  id: string;
  name: string;
  questionIds: string[];
  isExpanded: boolean;
}

export interface Questionnaire {
  id: string;
  projectName: string;
  name: string;
  description?: string;
  projectType: string;
  targetSampleSize: number;
  implementationStart: string;
  implementationEnd: string;
  fieldworkStart: string;
  fieldworkEnd: string;
  version: string;
  status: QuestionnaireStatus;
  lastUpdated: string;
  questions: Question[];
  blocks: QuestionBlock[];
}

export interface VersionEntry {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  status: QuestionnaireStatus;
  comment: string;
}
