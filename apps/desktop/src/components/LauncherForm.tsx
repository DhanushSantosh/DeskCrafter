import { Play, Save, Trash2 } from "lucide-react";
import type { Launcher, LauncherInput, LauncherKind } from "../lib/types";
import { categoriesToInput, normalizeCategoryInput } from "../lib/launcher";
import { Button } from "./Button";

export function LauncherForm({
  draft,
  selectedLauncher,
  onChange,
  onSave,
  onDelete,
  onLaunch,
}: {
  draft: LauncherInput;
  selectedLauncher: Launcher | null;
  onChange: (patch: Partial<LauncherInput>) => void;
  onSave: () => void;
  onDelete: () => void;
  onLaunch: () => void;
}) {
  return (
    <div className="form-grid">
      <label>
        <span>Name</span>
        <input value={draft.name} onChange={(event) => onChange({ name: event.target.value })} />
      </label>
      <label>
        <span>Kind</span>
        <select value={draft.kind} onChange={(event) => onChange({ kind: event.target.value as LauncherKind })}>
          <option value="application">Application</option>
          <option value="app_image">AppImage</option>
          <option value="script">Script</option>
          <option value="url">URL</option>
        </select>
      </label>
      <label className="span-two">
        <span>{draft.kind === "url" ? "URL" : "Executable"}</span>
        <input
          value={draft.kind === "url" ? draft.url ?? "" : draft.execPath}
          onChange={(event) =>
            draft.kind === "url"
              ? onChange({ url: event.target.value, execPath: "" })
              : onChange({ execPath: event.target.value, url: null })
          }
        />
      </label>
      <label className="span-two">
        <span>Description</span>
        <input value={draft.description} onChange={(event) => onChange({ description: event.target.value })} />
      </label>
      <label>
        <span>Icon</span>
        <input value={draft.iconPath} onChange={(event) => onChange({ iconPath: event.target.value })} />
      </label>
      <label>
        <span>Categories</span>
        <input
          value={categoriesToInput(draft.categories)}
          onChange={(event) => onChange({ categories: normalizeCategoryInput(event.target.value) })}
        />
      </label>
      <label className="toggle-row span-two">
        <input checked={draft.terminal} onChange={(event) => onChange({ terminal: event.target.checked })} type="checkbox" />
        <span>Launch in terminal</span>
      </label>
      <div className="action-row span-two">
        <Button onClick={onSave}>
          <Save size={16} />
          {selectedLauncher ? "Update launcher" : "Create launcher"}
        </Button>
        <Button variant="secondary" onClick={onLaunch}>
          <Play size={16} />
          Launch
        </Button>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 size={16} />
          Delete
        </Button>
      </div>
    </div>
  );
}
