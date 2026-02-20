import { GitBranch, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface StatusBarProps {
  fileName: string;
  line?: number;
  column?: number;
}

const StatusBar = ({ fileName, line = 1, column = 1 }: StatusBarProps) => {
  const language = fileName.endsWith(".tsx")
    ? "TypeScript React"
    : fileName.endsWith(".ts")
    ? "TypeScript"
    : fileName.endsWith(".json")
    ? "JSON"
    : fileName.endsWith(".css")
    ? "CSS"
    : fileName.endsWith(".md")
    ? "Markdown"
    : "Plain Text";

  return (
    <div className="flex items-center justify-between h-6 bg-vscode-statusbar text-vscode-statusbar-foreground text-[12px] px-2 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <GitBranch size={13} />
          <span>main</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <AlertTriangle size={13} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <Info size={13} />
            <span>0</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span>
          Ln {line}, Col {column}
        </span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>{language}</span>
        <div className="flex items-center gap-1">
          <CheckCircle size={13} />
          <span>Prettier</span>
        </div>
        <Bell size={13} />
      </div>
    </div>
  );
};

export default StatusBar;
