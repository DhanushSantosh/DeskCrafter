import type { GuidedCommand } from "../lib/types";

export function GuidedCommands({ commands }: { commands: GuidedCommand[] }) {
  return (
    <div className="guided-commands">
      <h2>Guided commands</h2>
      {commands.map((command) => (
        <div className="guided-command" key={`${command.label}-${command.command}`}>
          <div>
            <strong>{command.label}</strong>
            <span>{command.explanation}</span>
          </div>
          <div className="message message-warning">{command.privilegeLevel.replaceAll("_", " ")}</div>
          <code>{command.command}</code>
        </div>
      ))}
    </div>
  );
}
