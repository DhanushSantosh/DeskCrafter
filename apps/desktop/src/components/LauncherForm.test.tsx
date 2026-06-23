import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LauncherForm } from "./LauncherForm";
import { defaultLauncherInput } from "../lib/launcher";

describe("LauncherForm", () => {
  it("renders all form fields with default draft values", () => {
    render(
      <LauncherForm
        draft={defaultLauncherInput}
        selectedLauncher={null}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onLaunch={vi.fn()}
      />
    );
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Kind")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Icon")).toBeTruthy();
    expect(screen.getByText("Categories")).toBeTruthy();
  });

  it("fires onChange with name patch when name input changes", () => {
    const onChange = vi.fn();
    render(
      <LauncherForm
        draft={defaultLauncherInput}
        selectedLauncher={null}
        onChange={onChange}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onLaunch={vi.fn()}
      />
    );
    const nameInput = screen.getAllByRole("textbox")[0];
    fireEvent.change(nameInput, { target: { value: "MyApp" } });
    expect(onChange).toHaveBeenCalledWith({ name: "MyApp" });
  });

  it('shows "Create launcher" when no launcher is selected', () => {
    render(
      <LauncherForm
        draft={defaultLauncherInput}
        selectedLauncher={null}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onLaunch={vi.fn()}
      />
    );
    expect(screen.getByText("Create launcher")).toBeTruthy();
  });

  it('shows "Update launcher" when a launcher is selected', () => {
    const launcher = {
      id: "abc",
      name: "My App",
      description: "",
      execPath: "/usr/bin/myapp",
      iconPath: "",
      categories: [],
      terminal: false,
      kind: "application" as const,
      url: null,
      desktopFilePath: "/home/user/.local/share/applications/myapp.desktop",
      managed: true,
    };
    render(
      <LauncherForm
        draft={defaultLauncherInput}
        selectedLauncher={launcher}
        onChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onLaunch={vi.fn()}
      />
    );
    expect(screen.getByText("Update launcher")).toBeTruthy();
  });
});
