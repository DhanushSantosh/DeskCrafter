import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { buildLauncherInput, defaultLauncherInput } from "../lib/launcher";
import type { IconResolution, InspectTargetResult, LauncherInput, ValidationReport } from "../lib/types";

export function useLauncherForm({
  selectedId,
  setSelectedId,
  setStatus,
  refreshSuite,
}: {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  setStatus: (status: string) => void;
  refreshSuite: (announce?: boolean) => Promise<void>;
}) {
  const [draft, setDraft] = useState<LauncherInput>(defaultLauncherInput);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [iconResolution, setIconResolution] = useState<IconResolution | null>(null);
  const [inspectedTarget, setInspectedTarget] = useState<InspectTargetResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .validateLauncher(draft)
      .then((report) => {
        if (!cancelled) setValidation(report);
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setValidation({ valid: false, warnings: [], errors: [error.message], preview: "" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [draft]);

  function updateDraft(patch: Partial<LauncherInput>) {
    setDraft((current) => buildLauncherInput(current, patch));
  }

  async function saveLauncher() {
    const saved = selectedId
      ? await api.updateLauncher(selectedId, draft)
      : await api.createLauncher(draft);
    setSelectedId(saved.id);
    setStatus(`${saved.name} saved`);
    await refreshSuite();
  }

  async function resolveIcon() {
    const result = await api.resolveIcon(draft.iconPath);
    setIconResolution(result);
    setStatus(result.exists ? "Icon resolved" : "Icon will be treated as a theme name");
  }

  async function inspectTarget(targetInput: string) {
    const result = await api.inspectTarget(targetInput);
    setInspectedTarget(result);
    updateDraft({
      name: result.suggestedName,
      execPath: result.execPath,
      terminal: result.terminal,
      kind: result.kind,
      url: result.kind === "url" ? targetInput : null,
    });
    setStatus("Target inspected");
  }

  return {
    draft,
    setDraft,
    validation,
    iconResolution,
    inspectedTarget,
    updateDraft,
    saveLauncher,
    resolveIcon,
    inspectTarget,
  };
}
