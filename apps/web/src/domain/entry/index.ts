/**
 * Desktop Entry Domain Module
 *
 * This module provides TypeScript types, validators, and utilities
 * for working with desktop entry data in the DeskCrafter application.
 *
 * @example
 * import {
 *   Entry,
 *   EntryDraft,
 *   DEFAULT_DRAFT,
 *   validateEntryDraft,
 *   CATEGORY_OPTIONS,
 * } from '@/domain/entry';
 */

// Types
export type { Entry, EntryDraft } from "./types";
export { DEFAULT_DRAFT, isEntry, isEntryDraft, entryToDraft } from "./types";

// Constants
export {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY,
  DEFAULT_ENTRY_NAME,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_PATH_LENGTH,
  MAX_CATEGORIES_COUNT,
  type EntryCategory,
} from "./constants";

// Validators
export type { FieldValidationResult, EntryValidationResult } from "./validators";
export {
  // Required field validators
  validateName,
  validateExecPath,
  // Optional field validators
  validateIconPath,
  validateDescription,
  validateTerminal,
  validateCategory,
  validateCategories,
  // Composite validators
  validateEntryDraft,
  hasRequiredFields,
  // Sanitization helpers
  sanitizeSingleLine,
  normalizeCategories,
} from "./validators";

// Parser and Generator
export type { ParseResult, GenerateOptions } from "./parser";
export {
  parseDesktopEntry,
  generateDesktopEntry,
  parseDesktopEntryWithMetadata,
  validateDesktopFileFormat,
  PARSER_CONSTANTS,
} from "./parser";
