/**
 * Field validation rules for desktop entry fields
 */

import {
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_PATH_LENGTH,
  MAX_CATEGORIES_COUNT,
  CATEGORY_OPTIONS,
  type EntryCategory,
} from "./constants";
import type { EntryDraft } from "./types";

/**
 * Validation result for a single field
 */
export interface FieldValidationResult {
  /** Whether the field value is valid */
  valid: boolean;
  /** Error message if invalid, undefined if valid */
  error?: string;
}

/**
 * Validation result for an entire entry draft
 */
export interface EntryValidationResult {
  /** Whether all fields are valid */
  valid: boolean;
  /** Map of field names to their validation errors (only invalid fields included) */
  errors: Partial<Record<keyof EntryDraft, string>>;
}

// --- Required Field Validators ---

/**
 * Validates the entry name (required field)
 * - Must not be empty or whitespace-only
 * - Must not exceed maximum length
 * - Must not contain newlines
 */
export function validateName(value: string): FieldValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name must be ${MAX_NAME_LENGTH} characters or less`,
    };
  }

  if (/[\r\n]/.test(value)) {
    return { valid: false, error: "Name must not contain newlines" };
  }

  return { valid: true };
}

/**
 * Validates the executable path (required field)
 * - Must not be empty or whitespace-only
 * - Must not exceed maximum length
 * - Must not contain newlines
 */
export function validateExecPath(value: string): FieldValidationResult {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Executable path is required" };
  }

  if (trimmed.length > MAX_PATH_LENGTH) {
    return {
      valid: false,
      error: `Executable path must be ${MAX_PATH_LENGTH} characters or less`,
    };
  }

  if (/[\r\n]/.test(value)) {
    return { valid: false, error: "Executable path must not contain newlines" };
  }

  return { valid: true };
}

// --- Optional Field Validators ---

/**
 * Validates the icon path (optional field)
 * - Can be empty
 * - If provided, must not exceed maximum length
 * - Must not contain newlines
 */
export function validateIconPath(value: string): FieldValidationResult {
  if (value.length === 0) {
    return { valid: true };
  }

  if (value.length > MAX_PATH_LENGTH) {
    return {
      valid: false,
      error: `Icon path must be ${MAX_PATH_LENGTH} characters or less`,
    };
  }

  if (/[\r\n]/.test(value)) {
    return { valid: false, error: "Icon path must not contain newlines" };
  }

  return { valid: true };
}

/**
 * Validates the description (optional field)
 * - Can be empty
 * - If provided, must not exceed maximum length
 * - Must not contain newlines
 */
export function validateDescription(value: string): FieldValidationResult {
  if (value.length === 0) {
    return { valid: true };
  }

  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`,
    };
  }

  if (/[\r\n]/.test(value)) {
    return { valid: false, error: "Description must not contain newlines" };
  }

  return { valid: true };
}

/**
 * Validates the terminal flag (optional field)
 * - Must be a boolean
 */
export function validateTerminal(value: unknown): FieldValidationResult {
  if (typeof value !== "boolean") {
    return { valid: false, error: "Terminal must be a boolean value" };
  }

  return { valid: true };
}

/**
 * Validates a single category value
 * - Must be a non-empty string
 * - Optionally can be restricted to known categories
 */
export function validateCategory(
  value: string,
  strictMode = false
): FieldValidationResult {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, error: "Category must be a non-empty string" };
  }

  if (strictMode && !CATEGORY_OPTIONS.includes(value as EntryCategory)) {
    return {
      valid: false,
      error: `Category must be one of: ${CATEGORY_OPTIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Validates the categories array (optional field)
 * - Must be an array
 * - Each element must be a valid category string
 * - Must not exceed maximum count
 * - Duplicates are allowed but not recommended
 */
export function validateCategories(
  value: unknown,
  strictMode = false
): FieldValidationResult {
  if (!Array.isArray(value)) {
    return { valid: false, error: "Categories must be an array" };
  }

  if (value.length > MAX_CATEGORIES_COUNT) {
    return {
      valid: false,
      error: `Maximum ${MAX_CATEGORIES_COUNT} categories allowed`,
    };
  }

  for (let i = 0; i < value.length; i++) {
    const result = validateCategory(value[i], strictMode);
    if (!result.valid) {
      return {
        valid: false,
        error: `Category at index ${i}: ${result.error}`,
      };
    }
  }

  return { valid: true };
}

// --- Composite Validators ---

/**
 * Validates an entire entry draft
 * Returns all validation errors for invalid fields
 */
export function validateEntryDraft(
  draft: EntryDraft,
  strictCategories = false
): EntryValidationResult {
  const errors: Partial<Record<keyof EntryDraft, string>> = {};

  // Validate required fields
  const nameResult = validateName(draft.name);
  if (!nameResult.valid && nameResult.error) {
    errors.name = nameResult.error;
  }

  const execPathResult = validateExecPath(draft.execPath);
  if (!execPathResult.valid && execPathResult.error) {
    errors.execPath = execPathResult.error;
  }

  // Validate optional fields
  const iconPathResult = validateIconPath(draft.iconPath);
  if (!iconPathResult.valid && iconPathResult.error) {
    errors.iconPath = iconPathResult.error;
  }

  const descriptionResult = validateDescription(draft.description);
  if (!descriptionResult.valid && descriptionResult.error) {
    errors.description = descriptionResult.error;
  }

  const terminalResult = validateTerminal(draft.terminal);
  if (!terminalResult.valid && terminalResult.error) {
    errors.terminal = terminalResult.error;
  }

  const categoriesResult = validateCategories(draft.categories, strictCategories);
  if (!categoriesResult.valid && categoriesResult.error) {
    errors.categories = categoriesResult.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Quick check if an entry draft has valid required fields
 * Does not check optional fields - use validateEntryDraft for full validation
 */
export function hasRequiredFields(draft: EntryDraft): boolean {
  return validateName(draft.name).valid && validateExecPath(draft.execPath).valid;
}

// --- Sanitization Helpers ---

/**
 * Sanitizes a single-line string value
 * - Trims whitespace
 * - Replaces multiple whitespace with single space
 * - Removes newlines
 */
export function sanitizeSingleLine(value: string): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Normalizes a categories array
 * - Removes empty strings
 * - Removes duplicates
 * - Trims each category
 */
export function normalizeCategories(categories: string[]): string[] {
  const normalized = new Set(
    categories.map((cat) => sanitizeSingleLine(cat)).filter(Boolean)
  );
  return Array.from(normalized);
}
