import { BadgeCheck } from "lucide-react";
import type { ToolCategory, ToolDefinition } from "../lib/types";

const categoryLabels: Record<ToolCategory, string> = {
  launchers: "Launchers",
  startup: "Startup",
  apps: "Apps",
  associations: "Associations",
  sandboxes: "Sandboxes",
  permissions: "Permissions",
  advanced: "Advanced",
};

export function ToolMeta({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="notice suite-notice">
      <BadgeCheck size={16} />
      <span>
        {categoryLabels[tool.category]} · {tool.supportedDistros.join(", ")} · {tool.primaryActions.length} action(s)
      </span>
    </div>
  );
}
