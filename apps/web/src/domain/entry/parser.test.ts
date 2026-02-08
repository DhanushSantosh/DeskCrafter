/**
 * Tests for desktop file parser and generator
 */

import { describe, it, expect } from 'vitest';
import {
  parseDesktopEntry,
  generateDesktopEntry,
  parseDesktopEntryWithMetadata,
  validateDesktopFileFormat,
  PARSER_CONSTANTS,
  type ParseResult,
  type GenerateOptions,
} from './parser';
import type { EntryDraft, Entry } from './types';
import { DEFAULT_CATEGORY } from './constants';

describe('parseDesktopEntry', () => {
  it('should parse valid desktop entry successfully', () => {
    const content = `[Desktop Entry]
Version=1.0
Type=Application
Name=Test App
Comment=A test application
Exec=/usr/bin/test-app
TryExec=/usr/bin/test-app
Icon=test-app-icon
Categories=Utility;Development;
Terminal=false
X-DeskCrafter=true
StartupWMClass=DeskCrafter`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry).toEqual({
      name: 'Test App',
      description: 'A test application',
      execPath: '/usr/bin/test-app',
      iconPath: 'test-app-icon',
      categories: ['Utility', 'Development'],
      terminal: false,
    });
    expect(result.error).toBeUndefined();
  });

  it('should handle minimal valid desktop entry', () => {
    const content = `[Desktop Entry]
Name=Minimal App
Exec=/usr/bin/minimal
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry).toEqual({
      name: 'Minimal App',
      description: '',
      execPath: '/usr/bin/minimal',
      iconPath: '',
      categories: [DEFAULT_CATEGORY], // Should default to 'Utility'
      terminal: false,
    });
  });

  it('should parse terminal=true correctly', () => {
    const content = `[Desktop Entry]
Name=Terminal App
Exec=/usr/bin/terminal-app
Terminal=true
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.terminal).toBe(true);
  });

  it('should handle Windows-style line endings (CRLF)', () => {
    const content = `[Desktop Entry]\r\nName=Windows App\r\nExec=/usr/bin/app\r\nX-DeskCrafter=true\r\n`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.name).toBe('Windows App');
  });

  it('should ignore comment lines', () => {
    const content = `[Desktop Entry]
# This is a comment
Name=Commented App
# Another comment
Exec=/usr/bin/app
# Final comment
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.name).toBe('Commented App');
  });

  it('should ignore empty lines', () => {
    const content = `[Desktop Entry]

Name=Spaced App

Exec=/usr/bin/app

X-DeskCrafter=true

`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.name).toBe('Spaced App');
  });

  it('should handle categories with semicolons', () => {
    const content = `[Desktop Entry]
Name=Category App
Exec=/usr/bin/app
Categories=Development;Utility;Graphics;
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.categories).toEqual(['Development', 'Utility', 'Graphics']);
  });

  it('should normalize whitespace in category names', () => {
    const content = `[Desktop Entry]
Name=Messy Categories
Exec=/usr/bin/app
Categories= Development ; Utility  ; Graphics ;
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.categories).toEqual(['Development', 'Utility', 'Graphics']);
  });

  it('should handle empty categories gracefully', () => {
    const content = `[Desktop Entry]
Name=No Categories
Exec=/usr/bin/app
Categories=
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.categories).toEqual([DEFAULT_CATEGORY]);
  });

  it('should fail for non-DeskCrafter entries', () => {
    const content = `[Desktop Entry]
Name=System App
Exec=/usr/bin/system-app
Type=Application`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(false);
    expect(result.entry).toBeNull();
    expect(result.error).toBe('Not a DeskCrafter-managed desktop entry');
  });

  it('should fail for non-string content', () => {
    const result = parseDesktopEntry(123 as any);

    expect(result.success).toBe(false);
    expect(result.entry).toBeNull();
    expect(result.error).toBe('Content must be a string');
  });

  it('should handle malformed key-value pairs gracefully', () => {
    const content = `[Desktop Entry]
Name=Malformed App
InvalidLine
=EmptyKey
Exec=/usr/bin/app
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.name).toBe('Malformed App');
    expect(result.entry?.execPath).toBe('/usr/bin/app');
  });

  it('should trim whitespace from keys and values', () => {
    const content = `[Desktop Entry]
  Name  =  Whitespace App
  Exec  =  /usr/bin/app
X-DeskCrafter=true`;

    const result = parseDesktopEntry(content);

    expect(result.success).toBe(true);
    expect(result.entry?.name).toBe('Whitespace App');
    expect(result.entry?.execPath).toBe('/usr/bin/app');
  });
});

describe('generateDesktopEntry', () => {
  const sampleDraft: EntryDraft = {
    name: 'Sample App',
    description: 'A sample application',
    execPath: '/usr/bin/sample-app --flag',
    iconPath: 'sample-icon',
    terminal: false,
    categories: ['Development', 'Utility'],
  };

  it('should generate valid desktop entry with default options', () => {
    const content = generateDesktopEntry(sampleDraft);

    expect(content).toContain('[Desktop Entry]');
    expect(content).toContain('Version=1.0');
    expect(content).toContain('Type=Application');
    expect(content).toContain('Name=Sample App');
    expect(content).toContain('Comment=A sample application');
    expect(content).toContain('Exec=/usr/bin/sample-app --flag');
    expect(content).toContain('TryExec=/usr/bin/sample-app');
    expect(content).toContain('Icon=sample-icon');
    expect(content).toContain('Categories=Development;Utility;');
    expect(content).toContain('Terminal=false');
    expect(content).toContain('X-DeskCrafter=true');
    expect(content).toContain('StartupWMClass=DeskCrafter');
    expect(content).toEndWith('\n');
  });

  it('should handle terminal=true', () => {
    const terminalDraft: EntryDraft = {
      ...sampleDraft,
      terminal: true,
    };

    const content = generateDesktopEntry(terminalDraft);

    expect(content).toContain('Terminal=true');
  });

  it('should extract TryExec from Exec path', () => {
    const execDraft: EntryDraft = {
      ...sampleDraft,
      execPath: '/usr/bin/complex-app --arg1 --arg2 value',
    };

    const content = generateDesktopEntry(execDraft);

    expect(content).toContain('Exec=/usr/bin/complex-app --arg1 --arg2 value');
    expect(content).toContain('TryExec=/usr/bin/complex-app');
  });

  it('should handle empty TryExec gracefully', () => {
    const emptyExecDraft: EntryDraft = {
      ...sampleDraft,
      execPath: '',
    };

    const content = generateDesktopEntry(emptyExecDraft);

    expect(content).toContain('Exec=');
    expect(content).toContain('TryExec=');
  });

  it('should use default category when categories is empty', () => {
    const noCategoriesDraft: EntryDraft = {
      ...sampleDraft,
      categories: [],
    };

    const content = generateDesktopEntry(noCategoriesDraft);

    expect(content).toContain(`Categories=${DEFAULT_CATEGORY};`);
  });

  it('should sanitize single-line values', () => {
    const messyDraft: EntryDraft = {
      name: '  Messy   Name  \n\n  ',
      description: 'Description\nwith\nnewlines',
      execPath: '/usr/bin/app   --flag\t--another',
      iconPath: '  icon-path  ',
      terminal: false,
      categories: ['  Development  ', '', '  Utility  '],
    };

    const content = generateDesktopEntry(messyDraft);

    expect(content).toContain('Name=Messy Name');
    expect(content).toContain('Comment=Description with newlines');
    expect(content).toContain('Exec=/usr/bin/app --flag --another');
    expect(content).toContain('Icon=icon-path');
    expect(content).toContain('Categories=Development;Utility;');
  });

  it('should respect includeDeskCrafterFlag=false option', () => {
    const options: GenerateOptions = {
      includeDeskCrafterFlag: false,
    };

    const content = generateDesktopEntry(sampleDraft, options);

    expect(content).not.toContain('X-DeskCrafter=true');
  });

  it('should respect includeTryExec=false option', () => {
    const options: GenerateOptions = {
      includeTryExec: false,
    };

    const content = generateDesktopEntry(sampleDraft, options);

    expect(content).not.toContain('TryExec=');
  });

  it('should respect includeStartupWMClass=false option', () => {
    const options: GenerateOptions = {
      includeStartupWMClass: false,
    };

    const content = generateDesktopEntry(sampleDraft, options);

    expect(content).not.toContain('StartupWMClass=DeskCrafter');
  });

  it('should handle all options disabled', () => {
    const options: GenerateOptions = {
      includeDeskCrafterFlag: false,
      includeTryExec: false,
      includeStartupWMClass: false,
    };

    const content = generateDesktopEntry(sampleDraft, options);

    expect(content).toContain('[Desktop Entry]');
    expect(content).toContain('Name=Sample App');
    expect(content).not.toContain('TryExec=');
    expect(content).not.toContain('X-DeskCrafter=true');
    expect(content).not.toContain('StartupWMClass=DeskCrafter');
  });
});

describe('parseDesktopEntryWithMetadata', () => {
  it('should create full Entry object with metadata', () => {
    const content = `[Desktop Entry]
Name=Test App
Exec=/usr/bin/test
X-DeskCrafter=true`;

    const metadata = {
      id: 'test-app',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    };

    const result = parseDesktopEntryWithMetadata(content, metadata);

    expect(result.success).toBe(true);
    expect(result.entry).toEqual({
      id: 'test-app',
      name: 'Test App',
      description: '',
      execPath: '/usr/bin/test',
      iconPath: '',
      categories: [DEFAULT_CATEGORY],
      terminal: false,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  it('should propagate parsing errors', () => {
    const content = `[Desktop Entry]
Name=Invalid App
Exec=/usr/bin/invalid`;
    // Missing X-DeskCrafter flag

    const metadata = {
      id: 'invalid-app',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    };

    const result = parseDesktopEntryWithMetadata(content, metadata);

    expect(result.success).toBe(false);
    expect(result.entry).toBeNull();
    expect(result.error).toBe('Not a DeskCrafter-managed desktop entry');
  });
});

describe('validateDesktopFileFormat', () => {
  it('should validate correct desktop file format', () => {
    const content = `[Desktop Entry]
Name=Valid App
Exec=/usr/bin/valid`;

    expect(validateDesktopFileFormat(content)).toBe(true);
  });

  it('should reject non-string content', () => {
    expect(validateDesktopFileFormat(123 as any)).toBe(false);
    expect(validateDesktopFileFormat(null as any)).toBe(false);
    expect(validateDesktopFileFormat(undefined as any)).toBe(false);
  });

  it('should reject empty content', () => {
    expect(validateDesktopFileFormat('')).toBe(false);
    expect(validateDesktopFileFormat('   ')).toBe(false);
    expect(validateDesktopFileFormat('\n\n')).toBe(false);
  });

  it('should reject content without proper header', () => {
    const content = `Name=Invalid App
Exec=/usr/bin/invalid`;

    expect(validateDesktopFileFormat(content)).toBe(false);
  });

  it('should reject content with wrong header', () => {
    const content = `[Wrong Header]
Name=Invalid App
Exec=/usr/bin/invalid`;

    expect(validateDesktopFileFormat(content)).toBe(false);
  });

  it('should reject content without key-value pairs', () => {
    const content = `[Desktop Entry]`;

    expect(validateDesktopFileFormat(content)).toBe(false);
  });

  it('should reject content with only comments', () => {
    const content = `[Desktop Entry]
# Just a comment
# Another comment`;

    expect(validateDesktopFileFormat(content)).toBe(false);
  });

  it('should accept content with header and at least one key-value pair', () => {
    const content = `[Desktop Entry]
Name=Valid App`;

    expect(validateDesktopFileFormat(content)).toBe(true);
  });

  it('should handle content with empty lines and comments', () => {
    const content = `

[Desktop Entry]
# Comment
Name=Valid App

# Another comment
`;

    expect(validateDesktopFileFormat(content)).toBe(true);
  });

  it('should reject malformed key-value pairs', () => {
    const content = `[Desktop Entry]
InvalidLine`;

    expect(validateDesktopFileFormat(content)).toBe(false);
  });

  it('should reject empty key', () => {
    const content = `[Desktop Entry]
=EmptyKey`;

    expect(validateDesktopFileFormat(content)).toBe(false);
  });
});

describe('roundtrip parsing and generation', () => {
  it('should maintain data integrity through parse-generate cycle', () => {
    const originalDraft: EntryDraft = {
      name: 'Roundtrip App',
      description: 'Testing roundtrip functionality',
      execPath: '/usr/bin/roundtrip --test',
      iconPath: 'roundtrip-icon',
      terminal: true,
      categories: ['Development', 'Utility'],
    };

    // Generate desktop file content
    const generated = generateDesktopEntry(originalDraft);

    // Parse it back
    const parseResult = parseDesktopEntry(generated);

    expect(parseResult.success).toBe(true);
    expect(parseResult.entry).toEqual(originalDraft);
  });

  it('should handle edge cases in roundtrip', () => {
    const edgeCaseDraft: EntryDraft = {
      name: '',
      description: '',
      execPath: '',
      iconPath: '',
      terminal: false,
      categories: [],
    };

    const generated = generateDesktopEntry(edgeCaseDraft);
    const parseResult = parseDesktopEntry(generated);

    expect(parseResult.success).toBe(true);
    expect(parseResult.entry?.name).toBe('');
    expect(parseResult.entry?.description).toBe('');
    expect(parseResult.entry?.execPath).toBe('');
    expect(parseResult.entry?.iconPath).toBe('');
    expect(parseResult.entry?.terminal).toBe(false);
    expect(parseResult.entry?.categories).toEqual([DEFAULT_CATEGORY]);
  });
});

describe('PARSER_CONSTANTS', () => {
  it('should export expected constants', () => {
    expect(PARSER_CONSTANTS.DESKTOP_ENTRY_HEADER).toBe('[Desktop Entry]');
    expect(PARSER_CONSTANTS.DESKTOP_ENTRY_VERSION).toBe('1.0');
    expect(PARSER_CONSTANTS.DESKTOP_ENTRY_TYPE).toBe('Application');
    expect(PARSER_CONSTANTS.DESKCRAFTER_FLAG_KEY).toBe('X-DeskCrafter');
    expect(PARSER_CONSTANTS.DESKCRAFTER_FLAG_VALUE).toBe('true');
    expect(PARSER_CONSTANTS.STARTUP_WM_CLASS).toBe('DeskCrafter');
    expect(PARSER_CONSTANTS.CATEGORY_SEPARATOR).toBe(';');
    expect(PARSER_CONSTANTS.TERMINAL_TRUE).toBe('true');
    expect(PARSER_CONSTANTS.TERMINAL_FALSE).toBe('false');
    expect(PARSER_CONSTANTS.KEY_VALUE_SEPARATOR).toBe('=');
    expect(PARSER_CONSTANTS.COMMENT_PREFIX).toBe('#');
  });
});