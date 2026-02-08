import { describe, it, expect } from "vitest";
import {
  validateName,
  validateExecPath,
  validateIconPath,
  validateDescription,
  validateTerminal,
  validateCategory,
  validateCategories,
  validateEntryDraft,
  hasRequiredFields,
  sanitizeSingleLine,
  normalizeCategories,
} from "./validators";
import { MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_PATH_LENGTH } from "./constants";
import type { EntryDraft } from "./types";

describe("validateName", () => {
  it("should reject empty string", () => {
    const result = validateName("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name is required");
  });

  it("should reject whitespace-only string", () => {
    const result = validateName("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name is required");
  });

  it("should accept valid name", () => {
    const result = validateName("My Application");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject name exceeding max length", () => {
    const longName = "a".repeat(MAX_NAME_LENGTH + 1);
    const result = validateName(longName);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("100 characters or less");
  });

  it("should accept name at max length", () => {
    const maxName = "a".repeat(MAX_NAME_LENGTH);
    const result = validateName(maxName);
    expect(result.valid).toBe(true);
  });

  it("should reject name with newlines", () => {
    const result = validateName("My\nApplication");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name must not contain newlines");
  });

  it("should reject name with carriage return", () => {
    const result = validateName("My\rApplication");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Name must not contain newlines");
  });
});

describe("validateExecPath", () => {
  it("should reject empty string", () => {
    const result = validateExecPath("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Executable path is required");
  });

  it("should reject whitespace-only string", () => {
    const result = validateExecPath("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Executable path is required");
  });

  it("should accept valid path", () => {
    const result = validateExecPath("/usr/bin/myapp");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept command with arguments", () => {
    const result = validateExecPath("/usr/bin/myapp --flag value");
    expect(result.valid).toBe(true);
  });

  it("should reject path exceeding max length", () => {
    const longPath = "/usr/bin/" + "a".repeat(MAX_PATH_LENGTH);
    const result = validateExecPath(longPath);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("4096 characters or less");
  });

  it("should reject path with newlines", () => {
    const result = validateExecPath("/usr/bin/\nmyapp");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Executable path must not contain newlines");
  });
});

describe("validateIconPath", () => {
  it("should accept empty string (optional field)", () => {
    const result = validateIconPath("");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid path", () => {
    const result = validateIconPath("/usr/share/icons/myapp.png");
    expect(result.valid).toBe(true);
  });

  it("should accept icon theme name", () => {
    const result = validateIconPath("utilities-terminal");
    expect(result.valid).toBe(true);
  });

  it("should reject path exceeding max length", () => {
    const longPath = "a".repeat(MAX_PATH_LENGTH + 1);
    const result = validateIconPath(longPath);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("4096 characters or less");
  });

  it("should reject path with newlines", () => {
    const result = validateIconPath("/usr/share/icons/\nmyapp.png");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Icon path must not contain newlines");
  });
});

describe("validateDescription", () => {
  it("should accept empty string (optional field)", () => {
    const result = validateDescription("");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should accept valid description", () => {
    const result = validateDescription("A great application for productivity");
    expect(result.valid).toBe(true);
  });

  it("should reject description exceeding max length", () => {
    const longDesc = "a".repeat(MAX_DESCRIPTION_LENGTH + 1);
    const result = validateDescription(longDesc);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("500 characters or less");
  });

  it("should reject description with newlines", () => {
    const result = validateDescription("Line one\nLine two");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Description must not contain newlines");
  });
});

describe("validateTerminal", () => {
  it("should accept true", () => {
    const result = validateTerminal(true);
    expect(result.valid).toBe(true);
  });

  it("should accept false", () => {
    const result = validateTerminal(false);
    expect(result.valid).toBe(true);
  });

  it("should reject string 'true'", () => {
    const result = validateTerminal("true");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Terminal must be a boolean value");
  });

  it("should reject number", () => {
    const result = validateTerminal(1);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Terminal must be a boolean value");
  });

  it("should reject null", () => {
    const result = validateTerminal(null);
    expect(result.valid).toBe(false);
  });
});

describe("validateCategory", () => {
  it("should accept valid category string", () => {
    const result = validateCategory("Development");
    expect(result.valid).toBe(true);
  });

  it("should accept custom category in non-strict mode", () => {
    const result = validateCategory("CustomCategory", false);
    expect(result.valid).toBe(true);
  });

  it("should reject custom category in strict mode", () => {
    const result = validateCategory("CustomCategory", true);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be one of");
  });

  it("should accept known category in strict mode", () => {
    const result = validateCategory("Development", true);
    expect(result.valid).toBe(true);
  });

  it("should reject empty string", () => {
    const result = validateCategory("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Category must be a non-empty string");
  });

  it("should reject whitespace-only string", () => {
    const result = validateCategory("   ");
    expect(result.valid).toBe(false);
  });
});

describe("validateCategories", () => {
  it("should accept empty array", () => {
    const result = validateCategories([]);
    expect(result.valid).toBe(true);
  });

  it("should accept valid categories array", () => {
    const result = validateCategories(["Development", "Utility"]);
    expect(result.valid).toBe(true);
  });

  it("should reject non-array", () => {
    const result = validateCategories("Development");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Categories must be an array");
  });

  it("should reject array exceeding max count", () => {
    const manyCategories = Array.from({ length: 11 }, (_, i) => `Category${i}`);
    const result = validateCategories(manyCategories);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Maximum 10 categories allowed");
  });

  it("should reject array with invalid category", () => {
    const result = validateCategories(["Development", "", "Utility"]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Category at index 1");
  });

  it("should reject unknown categories in strict mode", () => {
    const result = validateCategories(["Development", "Unknown"], true);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Category at index 1");
  });
});

describe("validateEntryDraft", () => {
  const validDraft: EntryDraft = {
    name: "My App",
    execPath: "/usr/bin/myapp",
    iconPath: "",
    description: "",
    terminal: false,
    categories: [],
  };

  it("should validate a valid draft", () => {
    const result = validateEntryDraft(validDraft);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("should return errors for missing required fields", () => {
    const invalidDraft: EntryDraft = {
      ...validDraft,
      name: "",
      execPath: "",
    };
    const result = validateEntryDraft(invalidDraft);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBe("Name is required");
    expect(result.errors.execPath).toBe("Executable path is required");
  });

  it("should validate all fields in a complete draft", () => {
    const fullDraft: EntryDraft = {
      name: "My Application",
      execPath: "/usr/bin/myapp --verbose",
      iconPath: "/usr/share/icons/myapp.png",
      description: "A helpful application",
      terminal: true,
      categories: ["Development", "Utility"],
    };
    const result = validateEntryDraft(fullDraft);
    expect(result.valid).toBe(true);
  });

  it("should return multiple errors for multiple invalid fields", () => {
    const badDraft: EntryDraft = {
      name: "",
      execPath: "path\nwith\nnewlines",
      iconPath: "icon\npath",
      description: "desc\nnewline",
      terminal: false,
      categories: [],
    };
    const result = validateEntryDraft(badDraft);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.execPath).toBeDefined();
    expect(result.errors.iconPath).toBeDefined();
    expect(result.errors.description).toBeDefined();
  });
});

describe("hasRequiredFields", () => {
  it("should return true when required fields are valid", () => {
    const draft: EntryDraft = {
      name: "My App",
      execPath: "/usr/bin/myapp",
      iconPath: "",
      description: "",
      terminal: false,
      categories: [],
    };
    expect(hasRequiredFields(draft)).toBe(true);
  });

  it("should return false when name is empty", () => {
    const draft: EntryDraft = {
      name: "",
      execPath: "/usr/bin/myapp",
      iconPath: "",
      description: "",
      terminal: false,
      categories: [],
    };
    expect(hasRequiredFields(draft)).toBe(false);
  });

  it("should return false when execPath is empty", () => {
    const draft: EntryDraft = {
      name: "My App",
      execPath: "",
      iconPath: "",
      description: "",
      terminal: false,
      categories: [],
    };
    expect(hasRequiredFields(draft)).toBe(false);
  });

  it("should return false when both required fields are empty", () => {
    const draft: EntryDraft = {
      name: "",
      execPath: "",
      iconPath: "",
      description: "",
      terminal: false,
      categories: [],
    };
    expect(hasRequiredFields(draft)).toBe(false);
  });
});

describe("sanitizeSingleLine", () => {
  it("should trim whitespace", () => {
    expect(sanitizeSingleLine("  hello  ")).toBe("hello");
  });

  it("should replace multiple spaces with single space", () => {
    expect(sanitizeSingleLine("hello    world")).toBe("hello world");
  });

  it("should replace newlines with space", () => {
    expect(sanitizeSingleLine("hello\nworld")).toBe("hello world");
  });

  it("should handle tabs", () => {
    expect(sanitizeSingleLine("hello\t\tworld")).toBe("hello world");
  });

  it("should return empty string for non-string input", () => {
    expect(sanitizeSingleLine(null as unknown as string)).toBe("");
    expect(sanitizeSingleLine(undefined as unknown as string)).toBe("");
    expect(sanitizeSingleLine(123 as unknown as string)).toBe("");
  });
});

describe("normalizeCategories", () => {
  it("should remove duplicates", () => {
    const result = normalizeCategories(["Dev", "Dev", "Utility"]);
    expect(result).toEqual(["Dev", "Utility"]);
  });

  it("should remove empty strings", () => {
    const result = normalizeCategories(["Dev", "", "Utility", "  "]);
    expect(result).toEqual(["Dev", "Utility"]);
  });

  it("should trim whitespace", () => {
    const result = normalizeCategories(["  Dev  ", "Utility"]);
    expect(result).toEqual(["Dev", "Utility"]);
  });

  it("should return empty array for empty input", () => {
    const result = normalizeCategories([]);
    expect(result).toEqual([]);
  });

  it("should handle all empty strings", () => {
    const result = normalizeCategories(["", "  ", "\t"]);
    expect(result).toEqual([]);
  });
});
