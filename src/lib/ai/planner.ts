// ==================== PLANNER MODULE ====================
// Classical Planning — Forward Search with Goal Proximity Heuristic
// src/lib/ai/planner.ts

import type { LearningState, Goal, PlanningAction, PlanStep } from './types';

/**
 * Create the default set of 9 planning actions for the learning path.
 * Each action has a precondition (when it is usable) and an effect
 * (how it transforms the state).
 *
 * Actions are:
 *  - scan_first_object : kick-start the learning journey
 *  - scan_animal       : discover the Animals category
 *  - scan_food         : discover the Food category
 *  - scan_nature       : discover the Nature category
 *  - discover_more     : increment discovered-object count (capped at 5)
 *  - take_quiz         : mark quiz as completed
 *  - solve_puzzle      : mark puzzle as completed
 *  - listen_game       : increment listen score
 *  - chat_with_ai      : increment chat count
 */
export function createDefaultActions(): PlanningAction[] {
  return [
    {
      id: 'scan_first_object',
      name: 'Scan First Object',
      icon: '📷',
      description: 'Scan your first object to start learning!',
      precondition: (state: LearningState) => state.discoveredObjects.length === 0,
      effect: (state: LearningState) => ({
        ...state,
        discoveredObjects: [...state.discoveredObjects, ''],
      }),
    },
    {
      id: 'scan_animal',
      name: 'Scan Animal',
      icon: '🐾',
      description: 'Scan an animal to discover the Animals category',
      precondition: (state: LearningState) =>
        state.discoveredObjects.length > 0 && !state.categoriesSeen.includes('Animals'),
      effect: (state: LearningState) => ({
        ...state,
        discoveredObjects: [...state.discoveredObjects, ''],
        categoriesSeen: [...state.categoriesSeen, 'Animals'],
      }),
    },
    {
      id: 'scan_food',
      name: 'Scan Food',
      icon: '🍎',
      description: 'Scan food to discover the Food category',
      precondition: (state: LearningState) =>
        state.discoveredObjects.length > 0 && !state.categoriesSeen.includes('Food'),
      effect: (state: LearningState) => ({
        ...state,
        discoveredObjects: [...state.discoveredObjects, ''],
        categoriesSeen: [...state.categoriesSeen, 'Food'],
      }),
    },
    {
      id: 'scan_nature',
      name: 'Scan Nature',
      icon: '🌿',
      description: 'Scan nature to discover the Nature category',
      precondition: (state: LearningState) =>
        state.discoveredObjects.length > 0 && !state.categoriesSeen.includes('Nature'),
      effect: (state: LearningState) => ({
        ...state,
        discoveredObjects: [...state.discoveredObjects, ''],
        categoriesSeen: [...state.categoriesSeen, 'Nature'],
      }),
    },
    {
      id: 'discover_more',
      name: 'Discover More',
      icon: '🔍',
      description: 'Discover more objects to expand your collection',
      precondition: (state: LearningState) =>
        state.discoveredObjects.length > 0 && state.discoveredObjects.length < 5,
      effect: (state: LearningState) => ({
        ...state,
        discoveredObjects: [...state.discoveredObjects, ''],
      }),
    },
    {
      id: 'take_quiz',
      name: 'Take Quiz',
      icon: '📝',
      description: 'Take a quiz to test your knowledge!',
      precondition: (state: LearningState) =>
        state.discoveredObjects.length >= 3 && !state.quizCompleted,
      effect: (state: LearningState) => ({
        ...state,
        quizCompleted: true,
      }),
    },
    {
      id: 'solve_puzzle',
      name: 'Solve Puzzle',
      icon: '🧩',
      description: 'Solve a puzzle to sharpen your skills!',
      precondition: (state: LearningState) =>
        state.discoveredObjects.length >= 1 && !state.puzzleCompleted,
      effect: (state: LearningState) => ({
        ...state,
        puzzleCompleted: true,
      }),
    },
    {
      id: 'listen_game',
      name: 'Listen Game',
      icon: '🎵',
      description: 'Play the listen game to improve your listening skills!',
      precondition: (state: LearningState) => state.discoveredObjects.length >= 3,
      effect: (state: LearningState) => ({
        ...state,
        listenScore: state.listenScore + 1,
      }),
    },
    {
      id: 'chat_with_ai',
      name: 'Chat with AI',
      icon: '💬',
      description: 'Chat with AI to learn more about objects!',
      precondition: (state: LearningState) => state.discoveredObjects.length >= 1,
      effect: (state: LearningState) => ({
        ...state,
        chatCount: state.chatCount + 1,
      }),
    },
  ];
}

/**
 * Create the default goal for the learning path.
 *
 * The goal requires:
 *  - At least 5 discovered objects
 *  - All three required categories seen: Animals, Food, Nature
 *  - Quiz completed
 *  - Puzzle completed
 *  - Minimum listen score of 2
 */
export function createDefaultGoal(): Goal {
  return {
    minDiscoveredObjects: 5,
    requiredCategories: ['Animals', 'Food', 'Nature'],
    requireQuizCompleted: true,
    requirePuzzleCompleted: true,
    minListenScore: 2,
  };
}

// ==================== INTERNAL HELPERS ====================

/**
 * Create a stable hash string for a LearningState.
 * Used to detect visited states and prevent infinite loops during search.
 */
function hashState(state: LearningState): string {
  const sortedCategories = [...state.categoriesSeen].sort();
  return JSON.stringify({
    d: state.discoveredObjects.length,
    c: sortedCategories,
    q: state.quizCompleted,
    p: state.puzzleCompleted,
    l: state.listenScore,
    ch: state.chatCount,
  });
}

// ==================== PUBLIC FUNCTIONS ====================

/**
 * Check whether all conditions of the goal have been met in the given state.
 *
 * Validates every sub-goal:
 *  - discoveredObject count meets minimum
 *  - all required categories are present in categoriesSeen
 *  - quiz completion (if required)
 *  - puzzle completion (if required)
 *  - listen score meets minimum
 */
export function isGoalReached(state: LearningState, goal: Goal): boolean {
  if (state.discoveredObjects.length < goal.minDiscoveredObjects) {
    return false;
  }

  for (const cat of goal.requiredCategories) {
    if (!state.categoriesSeen.includes(cat)) {
      return false;
    }
  }

  if (goal.requireQuizCompleted && !state.quizCompleted) {
    return false;
  }

  if (goal.requirePuzzleCompleted && !state.puzzleCompleted) {
    return false;
  }

  if (state.listenScore < goal.minListenScore) {
    return false;
  }

  return true;
}

/**
 * Count how many sub-goals changed from unmet in `current` to met in `next`.
 *
 * This is the core heuristic for the forward search planner.  It measures
 * how much closer an action brings the state to the goal.
 *
 * Sub-goals checked:
 *  1. discoveredObjects >= minDiscoveredObjects
 *  2-4. Each required category (Animals, Food, Nature) newly seen
 *  5. quizCompleted became true (if required)
 *  6. puzzleCompleted became true (if required)
 *  7. listenScore >= minListenScore (if not already met)
 *
 * Maximum possible delta: 1 + 3 + 1 + 1 + 1 = 7
 */
export function goalProximityDelta(
  current: LearningState,
  next: LearningState,
  goal: Goal,
): number {
  let delta = 0;

  // 1. Discovered-objects threshold
  if (
    current.discoveredObjects.length < goal.minDiscoveredObjects &&
    next.discoveredObjects.length >= goal.minDiscoveredObjects
  ) {
    delta++;
  }

  // 2-4. Required categories newly present
  for (const cat of goal.requiredCategories) {
    if (!current.categoriesSeen.includes(cat) && next.categoriesSeen.includes(cat)) {
      delta++;
    }
  }

  // 5. Quiz completed
  if (goal.requireQuizCompleted && !current.quizCompleted && next.quizCompleted) {
    delta++;
  }

  // 6. Puzzle completed
  if (goal.requirePuzzleCompleted && !current.puzzleCompleted && next.puzzleCompleted) {
    delta++;
  }

  // 7. Listen-score threshold
  if (current.listenScore < goal.minListenScore && next.listenScore >= goal.minListenScore) {
    delta++;
  }

  return delta;
}

const MAX_PLAN_STEPS = 20;

/**
 * Generate a plan (ordered list of recommended actions) from the current state
 * toward the goal using forward search with a goal-proximity heuristic.
 *
 * ## Algorithm
 *
 * 1. Start with `current = state`
 * 2. While goal is not reached and plan length < MAX_PLAN_STEPS:
 *    a. Hash current state and add to visited set.
 *    b. Find all applicable actions whose *resulting* state is not yet visited.
 *    c. If none found, break (dead end).
 *    d. Among applicable actions, pick the one yielding the highest
 *       `goalProximityDelta`.  Ties are broken by first-in-list order
 *       (stable / deterministic).
 *    e. Apply the chosen action, record it as a PlanStep, and loop.
 * 3. Return the ordered array of PlanStep objects.
 *
 * The planner is **stateless**: it receives a snapshot of the current state
 * and returns a plan without storing any internal state.  The caller should
 * re-invoke this function whenever the user's actual state changes.
 *
 * @param state   Current learning state (snapshot)
 * @param goal    Goal to reach
 * @param actions Set of available planning actions
 * @returns Ordered array of PlanStep (empty if goal already reached or stuck)
 */
export function generatePlan(
  state: LearningState,
  goal: Goal,
  actions: PlanningAction[],
): PlanStep[] {
  const steps: PlanStep[] = [];
  let current: LearningState = { ...state };
  const visited = new Set<string>();

  while (!isGoalReached(current, goal) && steps.length < MAX_PLAN_STEPS) {
    const currentHash = hashState(current);
    visited.add(currentHash);

    // Filter: actions whose precondition holds AND whose resulting state is
    // not yet visited (prevents infinite loops via the same state).
    const applicable = actions.filter((action) => {
      if (!action.precondition(current)) return false;
      const nextState = action.effect(current);
      return !visited.has(hashState(nextState));
    });

    if (applicable.length === 0) break; // dead end — cannot make progress

    // Heuristic: pick the action with the highest goal-proximity delta.
    // Tie-break by first-in-list to keep the planner deterministic.
    let bestAction = applicable[0];
    let bestDelta = goalProximityDelta(current, bestAction.effect(current), goal);

    for (let i = 1; i < applicable.length; i++) {
      const candidate = applicable[i];
      const delta = goalProximityDelta(current, candidate.effect(current), goal);
      if (delta > bestDelta) {
        bestDelta = delta;
        bestAction = candidate;
      }
    }

    // Apply the chosen action
    current = bestAction.effect(current);

    steps.push({
      actionId: bestAction.id,
      actionName: bestAction.name,
      icon: bestAction.icon,
      description: bestAction.description,
      stepNumber: steps.length,
    });
  }

  return steps;
}
