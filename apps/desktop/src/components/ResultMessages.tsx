export function ResultMessages({
  label,
  tone,
  messages,
}: {
  label: string;
  tone: "error" | "warning" | "ok";
  messages: string[];
}) {
  if (messages.length === 0) {
    return null;
  }
  return (
    <div>
      <h2 className="compact-heading">{label}</h2>
      {messages.map((message) => (
        <div className={`message message-${tone}`} key={message}>
          {message}
        </div>
      ))}
    </div>
  );
}
