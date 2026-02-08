import { describe, it, expect } from "vitest";
import {
  isEntry,
  isEntryDraft,
  entryToDraft,
  DEFAULT_DRAFT,
  type Entry,
  type EntryDraft,
} from "./types";

describe("DEFAULT_DRAFT", () => {
  it("should have empty string for name", () => {
    expect(DEFAULT_DRAFT.name).toBe("");
  });

  it("should have empty string for execPath", () => {
    expect(DEFAULT_DRAFT.execPath).toBe("");
  });

  it("should have empty string for iconPath", () => {
    expect(DEFAULT_DRAFT.iconPath).toBe("");
  });

  it("should have empty string for description", () => {
    expect(DEFAULT_DRAFT.description).toBe("");
  });

  it("should have false for terminal", () => {
    expect(DEFAULT_DRAFT.terminal).toBe(false);
  });

  it("should have empty array for categories", () => {
    expect(DEFAULT_DRAFT.categories).toEqual([]);
  });
});

describe("isEntry", () => {
  const validEntry: Entry = {
    id: "test-id",
    name: "Test App",
    execPath: "/usr/bin/test",
    iconPath: "/usr/share/icons/test.png",
    description: "A test application",
    terminal: false,
    categories: ["Development"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  };

  it("should return true for valid Entry", () => {
    expect(isEntry(validEntry)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isEntry(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isEntry(undefined)).toBe(false);
  });

  it("should return false for string", () => {
    expect(isEntry("not an entry")).toBe(false);
  });

  it("should return false for number", () => {
    expect(isEntry(42)).toBe(false);
  });

  it("should return false when id is missing", () => {
    const { id: _, ...noId } = validEntry;
    expect(isEntry(noId)).toBe(false);
  });

  it("should return false when name is missing", () => {
    const { name: _, ...noName } = validEntry;
    expect(isEntry(noName)).toBe(false);
  });

  it("should return false when name is not a string", () => {
    expect(isEntry({ ...validEntry, name: 123 })).toBe(false);
  });

  it("should return false when execPath is missing", () => {
    const { execPath: _, ...noExec } = validEntry;
    expect(isEntry(noExec)).toBe(false);
  });

  it("should return false when terminal is not boolean", () => {
    expect(isEntry({ ...validEntry, terminal: "true" })).toBe(false);
  });

  it("should return false when categories is not an array", () => {
    expect(isEntry({ ...validEntry, categories: "Development" })).toBe(false);
  });

  it("should return false when categories contains non-strings", () => {
    expect(isEntry({ ...validEntry, categories: ["Dev", 123] })).toBe(false);
  });

  it("should return false when createdAt is missing", () => {
    const { createdAt: _, ...noCreated } = validEntry;
    expect(isEntry(noCreated)).toBe(false);
  });

  it("should return false when updatedAt is missing", () => {
    const { updatedAt: _, ...noUpdated } = validEntry;
    expect(isEntry(noUpdated)).toBe(false);
  });
});

describe("isEntryDraft", () => {
  const validDraft: EntryDraft = {
    name: "Test App",
    execPath: "/usr/bin/test",
    iconPath: "/usr/share/icons/test.png",
    description: "A test application",
    terminal: false,
    categories: ["Development"],
  };

  it("should return true for valid EntryDraft", () => {
    expect(isEntryDraft(validDraft)).toBe(true);
  });

  it("should return true for DEFAULT_DRAFT", () => {
    expect(isEntryDraft(DEFAULT_DRAFT)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isEntryDraft(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isEntryDraft(undefined)).toBe(false);
  });

  it("should return false when name is missing", () => {
    const { name: _, ...noName } = validDraft;
    expect(isEntryDraft(noName)).toBe(false);
  });

  it("should return false when execPath is missing", () => {
    const { execPath: _, ...noExec } = validDraft;
    expect(isEntryDraft(noExec)).toBe(false);
  });

  it("should return false when terminal is not boolean", () => {
    expect(isEntryDraft({ ...validDraft, terminal: 1 })).toBe(false);
  });

  it("should return false when categories is not array", () => {
    expect(isEntryDraft({ ...validDraft, categories: {} })).toBe(false);
  });

  it("should return false when categories contains non-strings", () => {
    expect(isEntryDraft({ ...validDraft, categories: [1, 2, 3] })).toBe(false);
  });

  it("should return true for Entry (superset)", () => {
    const entry: Entry = {
      ...validDraft,
      id: "test-id",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    };
    // Entry has all fields of EntryDraft plus more
    expect(isEntryDraft(entry)).toBe(true);
  });
});

describe("entryToDraft", () => {
  const entry: Entry = {
    id: "test-id",
    name: "Test App",
    execPath: "/usr/bin/test",
    iconPath: "/usr/share/icons/test.png",
    description: "A test application",
    terminal: true,
    categories: ["Development", "Utility"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  };

  it("should extract draft fields from entry", () => {
    const draft = entryToDraft(entry);
    expect(draft).toEqual({
      name: "Test App",
      execPath: "/usr/bin/test",
      iconPath: "/usr/share/icons/test.png",
      description: "A test application",
      terminal: true,
      categories: ["Development", "Utility"],
    });
  });

  it("should not include id in draft", () => {
    const draft = entryToDraft(entry);
    expect("id" in draft).toBe(false);
  });

  it("should not include createdAt in draft", () => {
    const draft = entryToDraft(entry);
    expect("createdAt" in draft).toBe(false);
  });

  it("should not include updatedAt in draft", () => {
    const draft = entryToDraft(entry);
    expect("updatedAt" in draft).toBe(false);
  });

  it("should create a copy of categories array", () => {
    const draft = entryToDraft(entry);
    expect(draft.categories).not.toBe(entry.categories);
    expect(draft.categories).toEqual(entry.categories);
  });

  it("should be a valid EntryDraft", () => {
    const draft = entryToDraft(entry);
    expect(isEntryDraft(draft)).toBe(true);
  });
});
