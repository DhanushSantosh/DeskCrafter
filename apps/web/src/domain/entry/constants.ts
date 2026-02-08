/**
 * Constants for desktop entry domain
 */

/** Available category options for desktop entries */
export const CATEGORY_OPTIONS = [
  "Development",
  "Utility",
  "Office",
  "Graphics",
  "Network",
  "AudioVideo",
  "System",
  "Game",
] as const;

/** Type representing a valid category value */
export type EntryCategory = (typeof CATEGORY_OPTIONS)[number];

/** Default category when none is specified */
export const DEFAULT_CATEGORY = "Utility" satisfies EntryCategory;

/** Default name for new entries */
export const DEFAULT_ENTRY_NAME = "Untitled Entry";

/** Maximum length for entry name */
export const MAX_NAME_LENGTH = 100;

/** Maximum length for description */
export const MAX_DESCRIPTION_LENGTH = 500;

/** Maximum length for file paths */
export const MAX_PATH_LENGTH = 4096;

/** Maximum number of categories per entry */
export const MAX_CATEGORIES_COUNT = 10;
