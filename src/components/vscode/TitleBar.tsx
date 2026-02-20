import { Minus, Square, X, Code2 } from "lucide-react";

const TitleBar = () => {
  return (
    <div className="flex items-center justify-between h-8 bg-vscode-titlebar border-b border-border select-none">
      <div className="flex items-center gap-2 px-3">
        <Code2 size={16} className="text-primary" />
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">File</span>
          <span className="hover:text-foreground cursor-pointer">Edit</span>
          <span className="hover:text-foreground cursor-pointer">Selection</span>
          <span className="hover:text-foreground cursor-pointer">View</span>
          <span className="hover:text-foreground cursor-pointer">Go</span>
          <span className="hover:text-foreground cursor-pointer">Run</span>
          <span className="hover:text-foreground cursor-pointer">Terminal</span>
          <span className="hover:text-foreground cursor-pointer">Help</span>
        </div>
      </div>
      <div className="text-[13px] text-muted-foreground">
        App.tsx — my-project — Visual Studio Code
      </div>
      <div className="flex items-center">
        <button className="w-12 h-8 flex items-center justify-center hover:bg-accent text-muted-foreground">
          <Minus size={16} />
        </button>
        <button className="w-12 h-8 flex items-center justify-center hover:bg-accent text-muted-foreground">
          <Square size={14} />
        </button>
        <button className="w-12 h-8 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground text-muted-foreground">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
