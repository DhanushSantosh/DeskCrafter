import { Image, Sparkles, Stethoscope } from "lucide-react";
import type { IconResolution, InspectTargetResult, Launcher, LauncherInput, LauncherIssue, ToolActionDescriptor } from "../lib/types";
import { Button } from "./Button";
import { LauncherForm } from "./LauncherForm";

export function LauncherModule({
  draft,
  selectedLauncher,
  inspectedTarget,
  iconResolution,
  issues,
  actions,
  onChange,
  onSave,
  onDelete,
  onLaunch,
  onResolveIcon,
  onRepair,
  onPrimaryAction,
}: {
  draft: LauncherInput;
  selectedLauncher: Launcher | null;
  inspectedTarget: InspectTargetResult | null;
  iconResolution: IconResolution | null;
  issues: LauncherIssue[];
  actions: ToolActionDescriptor[];
  onChange: (patch: Partial<LauncherInput>) => void;
  onSave: () => void;
  onDelete: () => void;
  onLaunch: () => void;
  onResolveIcon: () => void;
  onRepair: () => void;
  onPrimaryAction: (actionDescriptor: ToolActionDescriptor) => void;
}) {
  return (
    <>
      {inspectedTarget ? (
        <div className="notice">
          <Sparkles size={16} />
          <span>
            Suggested {inspectedTarget.kind.replace("_", " ")} launcher:{" "}
            <strong>{inspectedTarget.suggestedName}</strong>
          </span>
        </div>
      ) : null}
      <LauncherForm
        draft={draft}
        selectedLauncher={selectedLauncher}
        onChange={onChange}
        onSave={onSave}
        onDelete={onDelete}
        onLaunch={onLaunch}
      />
      <div className="suite-grid">
        <div className="terminal-card">
          <Image size={22} />
          <div>
            <h2>Icon resolution</h2>
            <p>
              {iconResolution
                ? iconResolution.resolvedPath ?? iconResolution.themeName ?? "unresolved"
                : "Resolve the icon field when needed."}
            </p>
          </div>
          <Button variant="secondary" onClick={onResolveIcon}>
            Resolve
          </Button>
        </div>
        <div className="terminal-card">
          <Stethoscope size={22} />
          <div>
            <h2>Launcher doctor</h2>
            <p>{issues.length === 0 ? "No launcher issues found." : `${issues.length} issue(s) found.`}</p>
          </div>
          <Button variant="secondary" onClick={onRepair}>
            Repair selected
          </Button>
        </div>
      </div>
      <div className="action-strip">
        {actions.map((actionDescriptor) => (
          <Button key={actionDescriptor.id} variant="secondary" onClick={() => onPrimaryAction(actionDescriptor)}>
            {actionDescriptor.label}
          </Button>
        ))}
      </div>
    </>
  );
}
