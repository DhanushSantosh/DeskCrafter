import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolResultPanel } from "./ToolResultPanel";
import type { ToolResult } from "../lib/types";

function makeResult(overrides: Partial<ToolResult> = {}): ToolResult {
  return {
    toolId: "permission_ownership_repair",
    summary: "Scanned",
    data: {},
    warnings: [],
    blockingIssues: [],
    performedActions: [],
    restartOrRefreshNeeded: [],
    beforeAfterState: null,
    guidedCommands: [],
    ...overrides,
  };
}

describe("ToolResultPanel", () => {
  it("renders action-first prompt when result is null", () => {
    render(<ToolResultPanel result={null} guidedCommands={[]} />);
    expect(screen.getByText("Action-first workflow")).toBeTruthy();
  });

  it("renders error messages with error styling", () => {
    render(
      <ToolResultPanel
        result={makeResult({ blockingIssues: ["Path is required"] })}
        guidedCommands={[]}
      />
    );
    const el = screen.getByText("Path is required");
    expect(el.className).toContain("message-error");
  });

  it("renders performed actions with ok styling", () => {
    render(
      <ToolResultPanel
        result={makeResult({ performedActions: ["permissions repaired"] })}
        guidedCommands={[]}
      />
    );
    const el = screen.getByText("permissions repaired");
    expect(el.className).toContain("message-ok");
  });

  it("renders before/after state when present", () => {
    render(
      <ToolResultPanel
        result={makeResult({ beforeAfterState: { before: "r--", after: "rwx" } })}
        guidedCommands={[]}
      />
    );
    expect(screen.getByText(/Before \/ after/i)).toBeTruthy();
  });

  it("renders result data as formatted JSON", () => {
    render(
      <ToolResultPanel
        result={makeResult({ data: { path: "/home/user" } })}
        guidedCommands={[]}
      />
    );
    expect(screen.getByText(/Result data/i)).toBeTruthy();
  });
});
