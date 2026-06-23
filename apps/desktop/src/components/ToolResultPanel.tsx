import type { GuidedCommand, ToolResult } from "../lib/types";
import { GuidedCommands } from "./GuidedCommands";
import { ResultMessages } from "./ResultMessages";

export function ToolResultPanel({
  result,
  guidedCommands,
}: {
  result: ToolResult | null;
  guidedCommands: GuidedCommand[];
}) {
  if (!result) {
    return (
      <div className="empty-tool-state">
        <h2>Action-first workflow</h2>
        <p>Scan the current tool or run one of its actions to see blocking issues, performed steps, and refresh requirements.</p>
      </div>
    );
  }

  return (
    <>
      <ResultMessages label="Warnings" tone="warning" messages={result.warnings} />
      <ResultMessages label="Blocking issues" tone="error" messages={result.blockingIssues} />
      <ResultMessages label="Performed" tone="ok" messages={result.performedActions} />
      <ResultMessages label="Refresh needed" tone="warning" messages={result.restartOrRefreshNeeded} />
      {result.beforeAfterState ? (
        <div>
          <h2 className="compact-heading">Before / after</h2>
          <pre className="data-preview">{JSON.stringify(result.beforeAfterState, null, 2)}</pre>
        </div>
      ) : null}
      <div>
        <h2 className="compact-heading">Result data</h2>
        <pre className="data-preview">{JSON.stringify(result.data, null, 2)}</pre>
      </div>
      {guidedCommands.length > 0 ? <GuidedCommands commands={guidedCommands} /> : null}
    </>
  );
}
