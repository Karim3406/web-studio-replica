import { useState } from "react";
import { X, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
}

const terminalLines = [
  { type: "info", text: "$ npm run dev" },
  { type: "info", text: "" },
  { type: "success", text: "  VITE v5.2.0  ready in 342ms" },
  { type: "info", text: "" },
  { type: "info", text: "  ➜  Local:   http://localhost:5173/" },
  { type: "muted", text: "  ➜  Network: http://192.168.1.42:5173/" },
  { type: "muted", text: "  ➜  press h + enter to show help" },
  { type: "info", text: "" },
  { type: "warning", text: "[vite] hmr update /src/components/App.tsx" },
  { type: "info", text: "$ |" },
];

const Terminal = ({ isOpen, onToggle }: TerminalProps) => {
  const [activeTerminal] = useState("bash");

  if (!isOpen) return null;

  return (
    <div className="bg-vscode-terminal border-t border-border flex flex-col" style={{ height: 200 }}>
      <div className="flex items-center justify-between px-4 py-1 border-b border-border bg-vscode-tab-inactive">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-foreground">TERMINAL</span>
          <span className="text-xs text-muted-foreground">PROBLEMS</span>
          <span className="text-xs text-muted-foreground">OUTPUT</span>
          <span className="text-xs text-muted-foreground">DEBUG CONSOLE</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-accent rounded">
            <Plus size={14} className="text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-accent rounded">
            <Trash2 size={14} className="text-muted-foreground" />
          </button>
          <button onClick={onToggle} className="p-1 hover:bg-accent rounded">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 px-4 py-2 overflow-y-auto scrollbar-thin font-mono text-sm">
        {terminalLines.map((line, i) => (
          <div
            key={i}
            className={`leading-5 ${
              line.type === "success"
                ? "text-syntax-number"
                : line.type === "warning"
                ? "text-syntax-decorator"
                : line.type === "muted"
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        <div className="flex items-center text-foreground leading-5">
          <span>$ </span>
          <span className="w-2 h-4 bg-foreground animate-cursor-blink ml-0.5" />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
