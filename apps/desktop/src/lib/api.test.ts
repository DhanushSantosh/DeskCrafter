import { describe, expect, it } from "vitest";
import { api } from "./api";

describe("suite api preview contracts", () => {
  it("lists the practical Linux tool suite in preview mode", async () => {
    const tools = await api.listTools();

    expect(tools.map((tool) => tool.id)).toEqual([
      "launcher_repair_integrator",
      "portable_app_integrator",
      "autostart_actions",
      "default_apps_mime_manager",
      "flatpak_permissions_manager",
      "permission_ownership_repair",
      "service_actions",
      "system_profile",
    ]);
    expect(tools.find((tool) => tool.id === "service_actions")?.privilegeLevel).toBe(
      "system_repair"
    );
  });

  it("returns a typed scan result envelope for suite tools", async () => {
    const result = await api.runToolScan("permission_ownership_repair", {
      path: "/tmp/example.AppImage",
    });

    expect(result.toolId).toBe("permission_ownership_repair");
    expect(result.summary).toBe("Preview scan completed");
    expect(result.warnings).toContain("Running outside Tauri; system data is mocked.");
    expect(result.guidedCommands).toEqual([]);
    expect(result.blockingIssues).toEqual([]);
  });

  it("exposes guided command requests as an empty preview list", async () => {
    await expect(api.listGuidedAdminCommands("service_actions")).resolves.toEqual([]);
  });
});
