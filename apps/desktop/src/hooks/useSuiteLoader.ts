import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Launcher, LauncherIssue, SystemProfile, ToolDefinition } from "../lib/types";

async function loadSuiteData() {
  const [systemProfile, definitions, launcherList, issueList] = await Promise.all([
    api.getSystemProfile(),
    api.listTools(),
    api.listLaunchers(),
    api.scanLauncherIssues(),
  ]);
  return { systemProfile, definitions, launcherList, issueList };
}

export function useSuiteLoader() {
  const [profile, setProfile] = useState<SystemProfile | null>(null);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [launchers, setLaunchers] = useState<Launcher[]>([]);
  const [issues, setIssues] = useState<LauncherIssue[]>([]);
  const [status, setStatus] = useState("Ready");

  const refreshSuite = useCallback(async (announce = true) => {
    if (announce) {
      setStatus("Refreshing suite");
    }
    const { systemProfile, definitions, launcherList, issueList } = await loadSuiteData();
    setProfile(systemProfile);
    setTools(definitions);
    setLaunchers(launcherList);
    setIssues(issueList);
    setStatus("Suite refreshed");
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { systemProfile, definitions, launcherList, issueList } = await loadSuiteData();
        if (active) {
          setProfile(systemProfile);
          setTools(definitions);
          setLaunchers(launcherList);
          setIssues(issueList);
          setStatus("Suite refreshed");
        }
      } catch (error) {
        if (active) {
          setStatus(error instanceof Error ? error.message : "Unable to refresh suite");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { profile, tools, launchers, setLaunchers, issues, status, setStatus, refreshSuite };
}
