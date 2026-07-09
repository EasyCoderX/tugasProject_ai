// ==================== KNOWLEDGE BASE TYPES ====================

export type PredicateName = 'isA' | 'hasProperty' | 'canDo' | 'livesIn' | 'hasColor' | 'hasSound' | 'hasDiet';

export interface Fact {
  predicate: PredicateName;
  args: string[];
}

export interface Rule {
  id: string;
  antecedents: Fact[];
  consequent: Fact;
  description: string;
}

export interface InferenceResult {
  newFacts: Fact[];
  derivations: string[];
}

export interface InferredTag {
  emoji: string;
  label: string;
  derivation: string;
}

// ==================== CSP TYPES ====================

export type Category = 'Animals' | 'Food' | 'Toys' | 'Vehicles' | 'Plants' | 'Electronics'
  | 'Furniture' | 'Clothing' | 'Tools' | 'Nature' | 'Sports' | 'Household'
  | 'School' | 'Music' | 'Art' | 'People' | 'Other';

export interface QuizObject {
  name: string;
  category: Category;
  difficulty: number;
  emoji: string;
  imageData?: string;
}

export interface QuizSlot {
  variableId: string;
  selectedObject: QuizObject;
  distractors: string[];
}

export interface CSPResult {
  slots: QuizSlot[];
  solutionFound: boolean;
}

// ==================== PLANNER TYPES ====================

export interface LearningState {
  discoveredObjects: string[];
  categoriesSeen: string[];
  quizCompleted: boolean;
  puzzleCompleted: boolean;
  listenScore: number;
  chatCount: number;
}

export interface Goal {
  minDiscoveredObjects: number;
  requiredCategories: string[];
  requireQuizCompleted: boolean;
  requirePuzzleCompleted: boolean;
  minListenScore: number;
}

export interface PlanningAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  precondition: (state: LearningState) => boolean;
  effect: (state: LearningState) => LearningState;
}

export interface PlanStep {
  actionId: string;
  actionName: string;
  icon: string;
  description: string;
  stepNumber: number;
}

// ==================== AGENT TYPES ====================

export interface PerceptionInput {
  type: 'scan_complete' | 'quiz_complete' | 'puzzle_complete' | 'listen_complete' | 'chat_sent' | 'app_launch';
  objectName?: string;
  objectCategory?: string;
  attributes?: string[];
}

export interface ActuatorCommands {
  displayNextSteps: PlanStep[];
  inferredTags: InferredTag[];
  quizStructure?: CSPResult;
}

export interface AgentOutput {
  newState: LearningState;
  commands: ActuatorCommands;
}
