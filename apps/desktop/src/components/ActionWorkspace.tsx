import { FolderCog } from "lucide-react";
import type { GuidedCommand, Launcher, ToolActionDescriptor, ToolDefinition, ToolResult } from "../lib/types";
import { Button } from "./Button";
import { ToolResultPanel } from "./ToolResultPanel";

export function ActionWorkspace({
  tool,
  selectedLauncher,
  onAction,
  result,
  guidedCommands,
}: {
  tool: ToolDefinition | null;
  selectedLauncher: Launcher | null;
  onAction: (actionDescriptor: ToolActionDescriptor) => void;
  result: ToolResult | null;
  guidedCommands: GuidedCommand[];
}) {
  if (!tool) {
    return null;
  }

  return (
    <div className="tool-result-panel">
      <div className="notice">
        <FolderCog size={16} />
        <span>
          {selectedLauncher ? `Selected launcher context: ${selectedLauncher.name}` : "Actions can run with or without a selected launcher context."}
        </span>
      </div>
      <div className="action-strip">
        {tool.primaryActions.map((actionDescriptor) => (
          <Button key={actionDescriptor.id} variant="secondary" onClick={() => onAction(actionDescriptor)}>
            {actionDescriptor.label}
          </Button>
        ))}
      </div>
      <ToolResultPanel result={result} guidedCommands={guidedCommands} />
    </div>
  );
}
