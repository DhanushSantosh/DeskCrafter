/**
 * TypeScript interfaces for desktop entry domain types
 */

/**
 * Represents a persisted desktop entry with full metadata.
 * This is the canonical type for entries that have been saved.
 */
export interface Entry {
  /** Unique identifier for the entry */
  id: string;
  /** Display name of the application (required) */
  name: string;
  /** Path to the executable or command to run (required) */
  execPath: string;
  /** Path to the icon or icon theme name (optional) */
  iconPath: string;
  /** Description/comment for the application (optional) */
  description: string;
  /** Whether the application should run in a terminal (optional, defaults to false) */
  terminal: boolean;
  /** List of category tags for the application (optional) */
  categories: string[];
  /** ISO timestamp when the entry was created */
  createdAt: string;
  /** ISO timestamp when the entry was last updated */
  updatedAt: string;
}

/**
 * Represents an entry being edited/created before persistence.
 * Omits system-managed fields (id, timestamps).
 */
export interface EntryDraft {
  /** Display name of the application (required) */
  name: string;
  /** Path to the executable or command to run (required) */
  execPath: string;
  /** Path to the icon or icon theme name (optional) */
  iconPath: string;
  /** Description/comment for the application (optional) */
  description: string;
  /** Whether the application should run in a terminal (optional) */
  terminal: boolean;
  /** List of category tags for the application (optional) */
  categories: string[];
}

/**
 * Default values for a new entry draft
 */
export const DEFAULT_DRAFT: EntryDraft = {
  name: "",
  execPath: "",
  iconPath: "",
  description: "",
  terminal: false,
  categories: [],
};

/**
 * Type guard to check if a value is an Entry
 */
export function isEntry(value: unknown): value is Entry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.execPath === "string" &&
    typeof obj.iconPath === "string" &&
    typeof obj.description === "string" &&
    typeof obj.terminal === "boolean" &&
    Array.isArray(obj.categories) &&
    obj.categories.every((cat) => typeof cat === "string") &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string"
  );
}

/**
 * Type guard to check if a value is an EntryDraft
 */
export function isEntryDraft(value: unknown): value is EntryDraft {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.name === "string" &&
    typeof obj.execPath === "string" &&
    typeof obj.iconPath === "string" &&
    typeof obj.description === "string" &&
    typeof obj.terminal === "boolean" &&
    Array.isArray(obj.categories) &&
    obj.categories.every((cat) => typeof cat === "string")
  );
}

/**
 * Extracts draft fields from an Entry (removes system-managed fields)
 */
export function entryToDraft(entry: Entry): EntryDraft {
  return {
    name: entry.name,
    execPath: entry.execPath,
    iconPath: entry.iconPath,
    description: entry.description,
    terminal: entry.terminal,
    categories: [...entry.categories],
  };
}
