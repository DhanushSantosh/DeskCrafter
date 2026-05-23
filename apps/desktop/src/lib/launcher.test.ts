import { describe, expect, it } from "vitest";
import {
  buildLauncherInput,
  categoriesToInput,
  defaultLauncherInput,
  normalizeCategoryInput,
  previewFallback,
} from "./launcher";

describe("launcher helpers", () => {
  it("normalizes category input", () => {
    expect(normalizeCategoryInput("Utility, Development, Utility")).toEqual([
      "Utility",
      "Development",
    ]);
  });

  it("defaults empty categories to Utility", () => {
    expect(normalizeCategoryInput("")).toEqual(["Utility"]);
  });

  it("serializes category arrays for form fields", () => {
    expect(categoriesToInput(["Utility", "System"])).toBe("Utility, System");
  });

  it("builds patched launcher input without losing categories", () => {
    const input = buildLauncherInput(defaultLauncherInput, { name: "Terminal" });
    expect(input.categories).toEqual(["Utility"]);
    expect(input.name).toBe("Terminal");
  });

  it("previews URL launchers without Exec", () => {
    const preview = previewFallback({
      ...defaultLauncherInput,
      kind: "url",
      url: "https://example.com",
      execPath: "",
    });
    expect(preview).toContain("Type=Link");
    expect(preview).toContain("URL=https://example.com");
    expect(preview).not.toContain("Exec=");
  });
});
