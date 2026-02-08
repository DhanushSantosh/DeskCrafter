/**
 * Desktop file parser and generator
 *
 * Implements parsing logic to read and deserialize .desktop files into Entry objects,
 * and generation logic to serialize Entry objects back to FreeDesktop-compliant
 * .desktop file format with proper headers and escaping.
 *
 * Follows the FreeDesktop Desktop Entry Specification 1.0:
 * https://specifications.freedesktop.org/desktop-entry-spec/desktop-entry-spec-1.0.html
 */

import type { Entry, EntryDraft } from './types';
import { sanitizeSingleLine, normalizeCategories } from './validators';
import { DEFAULT_CATEGORY } from './constants';

// Desktop file format constants
const DESKTOP_ENTRY_HEADER = '[Desktop Entry]';
const DESKTOP_ENTRY_VERSION = '1.0';
const DESKTOP_ENTRY_TYPE = 'Application';
const DESKCRAFTER_FLAG_KEY = 'X-DeskCrafter';
const DESKCRAFTER_FLAG_VALUE = 'true';
const STARTUP_WM_CLASS = 'DeskCrafter';
const CATEGORY_SEPARATOR = ';';
const TERMINAL_TRUE = 'true';
const TERMINAL_FALSE = 'false';

// Parsing constants
const LINE_SPLIT_REGEX = /\r?\n/;
const KEY_VALUE_SEPARATOR = '=';
const COMMENT_PREFIX = '#';
const TRY_EXEC_SEPARATOR = ' ';

/**
 * Represents the result of parsing a desktop file
 */
export interface ParseResult {
  /** Whether parsing was successful */
  success: boolean;
  /** Parsed entry data (null if parsing failed) */
  entry: EntryDraft | null;
  /** Error message if parsing failed */
  error?: string;
}

/**
 * Options for generating desktop file content
 */
export interface GenerateOptions {
  /** Whether to include DeskCrafter-specific metadata (default: true) */
  includeDeskCrafterFlag?: boolean;
  /** Whether to include the TryExec field (default: true) */
  includeTryExec?: boolean;
  /** Whether to include StartupWMClass field (default: true) */
  includeStartupWMClass?: boolean;
}

/**
 * Extracts the TryExec value from an Exec path
 * TryExec should be the first command/executable before any arguments
 */
function extractTryExec(execPath: string): string {
  if (!execPath) {
    return '';
  }
  const pieces = execPath.split(TRY_EXEC_SEPARATOR).filter(Boolean);
  return pieces[0] || '';
}

/**
 * Parses a desktop file content string into an EntryDraft object
 *
 * @param content - The raw desktop file content as a string
 * @returns ParseResult containing success status and parsed data
 *
 * @example
 * ```typescript
 * const content = `[Desktop Entry]
 * Version=1.0
 * Type=Application
 * Name=My App
 * Exec=/path/to/app
 * X-DeskCrafter=true`;
 *
 * const result = parseDesktopEntry(content);
 * if (result.success) {
 *   console.log(result.entry?.name); // "My App"
 * }
 * ```
 */
export function parseDesktopEntry(content: string): ParseResult {
  if (typeof content !== 'string') {
    return {
      success: false,
      entry: null,
      error: 'Content must be a string'
    };
  }

  const lines = content.split(LINE_SPLIT_REGEX);
  const data: Record<string, string> = {};

  // Parse key-value pairs
  for (const line of lines) {
    // Skip empty lines and comments
    if (!line || line.startsWith(COMMENT_PREFIX)) {
      continue;
    }

    const separatorIndex = line.indexOf(KEY_VALUE_SEPARATOR);
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) {
      data[key] = value;
    }
  }

  // Validate that this is a DeskCrafter-managed desktop entry
  // This prevents parsing arbitrary system desktop files
  if (data[DESKCRAFTER_FLAG_KEY] !== DESKCRAFTER_FLAG_VALUE) {
    return {
      success: false,
      entry: null,
      error: 'Not a DeskCrafter-managed desktop entry'
    };
  }

  // Parse categories from semicolon-separated string
  const categories = typeof data.Categories === 'string'
    ? data.Categories.split(CATEGORY_SEPARATOR).filter(Boolean)
    : [];

  // Create EntryDraft object with parsed data
  const entry: EntryDraft = {
    name: data.Name || '',
    description: data.Comment || '',
    execPath: data.Exec || '',
    iconPath: data.Icon || '',
    categories: normalizeCategories(categories),
    terminal: data.Terminal === TERMINAL_TRUE,
  };

  return {
    success: true,
    entry,
  };
}

/**
 * Generates FreeDesktop-compliant .desktop file content from an EntryDraft
 *
 * @param entry - The EntryDraft to serialize
 * @param options - Options for content generation
 * @returns The generated desktop file content as a string
 *
 * @example
 * ```typescript
 * const draft: EntryDraft = {
 *   name: 'My App',
 *   execPath: '/path/to/app',
 *   iconPath: 'app-icon',
 *   description: 'A sample application',
 *   terminal: false,
 *   categories: ['Utility']
 * };
 *
 * const content = generateDesktopEntry(draft);
 * console.log(content);
 * // Outputs properly formatted .desktop file content
 * ```
 */
export function generateDesktopEntry(
  entry: EntryDraft,
  options: GenerateOptions = {}
): string {
  const {
    includeDeskCrafterFlag = true,
    includeTryExec = true,
    includeStartupWMClass = true
  } = options;

  // Sanitize and normalize all fields
  const categories = normalizeCategories(entry.categories || []);
  const execPath = sanitizeSingleLine(entry.execPath);
  const iconPath = sanitizeSingleLine(entry.iconPath);
  const comment = sanitizeSingleLine(entry.description);
  const name = sanitizeSingleLine(entry.name);

  const terminalValue = entry.terminal ? TERMINAL_TRUE : TERMINAL_FALSE;
  const tryExec = extractTryExec(execPath);

  // Build the desktop entry content following FreeDesktop spec
  const lines: string[] = [
    DESKTOP_ENTRY_HEADER,
    `Version=${DESKTOP_ENTRY_VERSION}`,
    `Type=${DESKTOP_ENTRY_TYPE}`,
    `Name=${name}`,
    `Comment=${comment}`,
    `Exec=${execPath}`,
  ];

  // Add optional TryExec field
  if (includeTryExec && tryExec) {
    lines.push(`TryExec=${tryExec}`);
  }

  // Add icon field
  lines.push(`Icon=${iconPath}`);

  // Add categories with trailing semicolon per FreeDesktop spec
  lines.push(`Categories=${categories.join(CATEGORY_SEPARATOR)}${CATEGORY_SEPARATOR}`);

  // Add terminal field
  lines.push(`Terminal=${terminalValue}`);

  // Add DeskCrafter-specific metadata
  if (includeDeskCrafterFlag) {
    lines.push(`${DESKCRAFTER_FLAG_KEY}=${DESKCRAFTER_FLAG_VALUE}`);
  }

  // Add StartupWMClass for window manager integration
  if (includeStartupWMClass) {
    lines.push(`StartupWMClass=${STARTUP_WM_CLASS}`);
  }

  // Add trailing empty line per convention
  lines.push('');

  return lines.join('\n');
}

/**
 * Parses desktop file content and creates a full Entry object with metadata
 *
 * @param content - The raw desktop file content
 * @param metadata - Additional metadata for the entry
 * @returns ParseResult with Entry object instead of EntryDraft
 *
 * @example
 * ```typescript
 * const result = parseDesktopEntryWithMetadata(content, {
 *   id: 'my-app',
 *   createdAt: new Date().toISOString(),
 *   updatedAt: new Date().toISOString()
 * });
 * ```
 */
export function parseDesktopEntryWithMetadata(
  content: string,
  metadata: {
    id: string;
    createdAt: string;
    updatedAt: string;
  }
): { success: boolean; entry: Entry | null; error?: string } {
  const parseResult = parseDesktopEntry(content);

  if (!parseResult.success || !parseResult.entry) {
    return {
      success: false,
      entry: null,
      error: parseResult.error
    };
  }

  const entry: Entry = {
    ...parseResult.entry,
    ...metadata
  };

  return {
    success: true,
    entry
  };
}

/**
 * Validates desktop file format without full parsing
 * Useful for quick validation before attempting to parse
 *
 * @param content - The desktop file content to validate
 * @returns True if the content appears to be a valid desktop file format
 */
export function validateDesktopFileFormat(content: string): boolean {
  if (typeof content !== 'string' || !content.trim()) {
    return false;
  }

  const lines = content.split(LINE_SPLIT_REGEX);

  // Must start with [Desktop Entry] header
  const firstNonEmptyLine = lines.find(line => line.trim() !== '');
  if (firstNonEmptyLine !== DESKTOP_ENTRY_HEADER) {
    return false;
  }

  // Must have at least one key=value pair
  const hasKeyValuePair = lines.some(line => {
    const trimmed = line.trim();
    return trimmed &&
           !trimmed.startsWith(COMMENT_PREFIX) &&
           trimmed.includes(KEY_VALUE_SEPARATOR) &&
           trimmed.indexOf(KEY_VALUE_SEPARATOR) > 0;
  });

  return hasKeyValuePair;
}

// Export constants for use in tests and other modules
export const PARSER_CONSTANTS = {
  DESKTOP_ENTRY_HEADER,
  DESKTOP_ENTRY_VERSION,
  DESKTOP_ENTRY_TYPE,
  DESKCRAFTER_FLAG_KEY,
  DESKCRAFTER_FLAG_VALUE,
  STARTUP_WM_CLASS,
  CATEGORY_SEPARATOR,
  TERMINAL_TRUE,
  TERMINAL_FALSE,
  LINE_SPLIT_REGEX,
  KEY_VALUE_SEPARATOR,
  COMMENT_PREFIX,
} as const;