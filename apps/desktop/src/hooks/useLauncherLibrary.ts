import { useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Launcher } from "../lib/types";

export function useLauncherLibrary({
  launchers,
  setStatus,
}: {
  launchers: Launcher[];
  setStatus: (status: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLauncher = useMemo(
    () => launchers.find((launcher) => launcher.id === selectedId) ?? null,
    [launchers, selectedId]
  );

  async function launchSelected() {
    if (!selectedId) {
      setStatus("Select a launcher to run");
      return;
    }
    await api.launchEntry(selectedId);
    setStatus("Launch requested");
  }

  return { selectedId, setSelectedId, selectedLauncher, launchSelected };
}
