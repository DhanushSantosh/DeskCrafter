import { describe, expect, it } from "vitest";
import { api } from "./api";

describe("suite api preview contracts", () => {
  it("lists the practical Linux tool suite in preview mode", async () => {
    const tools = await api.listTools();

    expect(tools.map((tool) => tool.id)).toEqual([
      "launcher_manager",
      "autostart_manager",
      "appimage_manager",
      "environment_path",
      "service_viewer",
      "disk_cache_inspector",
      "permissions_helper",
      "system_profile",
    ]);
    expect(tools.find((tool) => tool.id === "service_viewer")?.riskLevel).toBe("guided_admin");
  });

  it("returns a typed scan result envelope for suite tools", async () => {
    const result = await api.runToolScan("permissions_helper", { path: "/tmp/example.AppImage" });

    expect(result.toolId).toBe("permissions_helper");
    expect(result.summary).toBe("Preview scan completed");
    expect(result.warnings).toContain("Running outside Tauri; system data is mocked.");
    expect(result.guidedCommands).toEqual([]);
  });

  it("exposes guided command requests as an empty preview list", async () => {
    await expect(api.listGuidedAdminCommands("service_viewer")).resolves.toEqual([]);
  });
});
