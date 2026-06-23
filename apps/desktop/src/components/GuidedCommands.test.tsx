import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuidedCommands } from "./GuidedCommands";
import type { GuidedCommand } from "../lib/types";

const commands: GuidedCommand[] = [
  {
    label: "Check a service",
    command: "systemctl status pipewire",
    privilegeLevel: "read_only",
    explanation: "Shows the current state of a service.",
  },
  {
    label: "Repair ownership",
    command: "sudo chown -R $USER ~/.local/share/applications",
    privilegeLevel: "system_repair",
    explanation: "Restores ownership of launcher directories.",
  },
];

describe("GuidedCommands", () => {
  it("renders label and explanation for each command", () => {
    render(<GuidedCommands commands={commands} />);
    expect(screen.getByText("Check a service")).toBeTruthy();
    expect(screen.getByText("Shows the current state of a service.")).toBeTruthy();
    expect(screen.getByText("Repair ownership")).toBeTruthy();
  });

  it("renders privilege level badge for each command", () => {
    render(<GuidedCommands commands={commands} />);
    expect(screen.getByText("read only")).toBeTruthy();
    expect(screen.getByText("system repair")).toBeTruthy();
  });

  it("renders command text in a code element", () => {
    render(<GuidedCommands commands={commands} />);
    expect(screen.getByText("systemctl status pipewire")).toBeTruthy();
    const codeEl = screen.getByText("systemctl status pipewire").closest("code");
    expect(codeEl).toBeTruthy();
  });
});
