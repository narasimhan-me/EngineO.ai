/**
 * Answer Engine Types for the web app
 *
 * This is a local copy of the Answer Engine types from @engineo/shared to work around
 * Next.js module resolution issues with monorepo workspace packages.
 */

/**
 * Canonical Phase 1 answer question categories.
 * These represent the key buyer/AI questions that products should answer.
 */
export type AnswerBlockQuestionId =
  | 'what_is_it'
  | 'who_is_it_for'
  | 'why_choose_this'
  | 'key_features'
  | 'how_is_it_used'
  | 'problems_it_solves'
  | 'what_makes_it_different'
  | 'whats_included'
  | 'materials_and_specs'
  | 'care_safety_instructions';

/**
 * Human-readable labels for question categories.
 * Useful for UI display and documentation.
 */
export const ANSWER_QUESTION_LABELS: Record<AnswerBlockQuestionId, string> = {
  what_is_it: 'What is this?',
  who_is_it_for: 'Who is it for?',
  why_choose_this: 'Why choose this?',
  key_features: 'What are the key features?',
  how_is_it_used: 'How is it used?',
  problems_it_solves: 'What problems does it solve?',
  what_makes_it_different: 'What makes it different?',
  whats_included: "What's included?",
  materials_and_specs: 'Materials / Specs',
  care_safety_instructions: 'Care / safety / instructions',
};

/**
 * List of all canonical Phase 1 question IDs.
 */
export const ANSWER_QUESTION_IDS: AnswerBlockQuestionId[] = [
  'what_is_it',
  'who_is_it_for',
  'why_choose_this',
  'key_features',
  'how_is_it_used',
  'problems_it_solves',
  'what_makes_it_different',
  'whats_included',
  'materials_and_specs',
  'care_safety_instructions',
];
