import { useMemo, useState } from "react";
import { api } from "../lib/api";
import type { GuidedCommand, ToolActionDescriptor, ToolCategory, ToolDefinition, ToolResult } from "../lib/types";

const launcherToolId = "launcher_repair_integrator";

export function useToolWorkspace({
  tools,
  selectedId,
  setStatus,
  refreshSuite,
}: {
  tools: ToolDefinition[];
  selectedId: string | null;
  setStatus: (status: string) => void;
  refreshSuite: (announce?: boolean) => Promise<void>;
}) {
  const [activeToolId, setActiveToolId] = useState(launcherToolId);
  const [targetInput, setTargetInput] = useState("");
  const [actionValue, setActionValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [allowElevation, setAllowElevation] = useState(true);
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);
  const [guidedCommands, setGuidedCommands] = useState<GuidedCommand[]>([]);

  const activeTool = useMemo(
    () => tools.find((tool) => tool.id === activeToolId) ?? null,
    [tools, activeToolId]
  );

  const groupedTools = useMemo(() => {
    const grouped = new Map<ToolCategory, ToolDefinition[]>();
    for (const tool of tools) {
      const current = grouped.get(tool.category) ?? [];
      current.push(tool);
      grouped.set(tool.category, current);
    }
    return grouped;
  }, [tools]);

  async function scanTool(toolId = activeToolId) {
    setStatus("Scanning tool");
    const result = await api.runToolScan(toolId, {
      query: targetInput || null,
      path: targetInput || null,
      targetId: selectedId,
    });
    const commands = await api.listGuidedAdminCommands(toolId);
    setToolResult(result);
    setGuidedCommands(commands.length > 0 ? commands : result.guidedCommands);
    setStatus(result.summary);
  }

  async function selectTool(tool: ToolDefinition) {
    setActiveToolId(tool.id);
    setToolResult(null);
    setGuidedCommands([]);
    if (tool.id !== launcherToolId) {
      await scanTool(tool.id);
    }
  }

  async function runPrimaryAction(tool: ToolDefinition, descriptor: ToolActionDescriptor) {
    if (descriptor.kind === "scan") {
      await scanTool(tool.id);
      return;
    }

    const input = {
      action: descriptor.id,
      path: targetInput || null,
      query: targetInput || null,
      targetId: selectedId,
      value: actionValue || selectedId || null,
      secondaryValue: secondaryValue || null,
      allowElevation,
    };

    const validationResult = await api.validateToolAction(tool.id, input);
    setToolResult(validationResult);
    setGuidedCommands(validationResult.guidedCommands);
    if (validationResult.blockingIssues.length > 0) {
      setStatus("Action blocked");
      return;
    }

    const applied = await api.applyToolAction(tool.id, input);
    setToolResult(applied);
    setGuidedCommands(applied.guidedCommands);
    setStatus(applied.summary);
    await refreshSuite(false);
  }

  return {
    activeToolId,
    setActiveToolId,
    targetInput,
    setTargetInput,
    actionValue,
    setActionValue,
    secondaryValue,
    setSecondaryValue,
    allowElevation,
    setAllowElevation,
    toolResult,
    guidedCommands,
    activeTool,
    groupedTools,
    scanTool,
    selectTool,
    runPrimaryAction,
  };
}
