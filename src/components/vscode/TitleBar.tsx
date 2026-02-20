import { useState, useRef, useEffect } from "react";
import { Minus, Square, X, Code2, FolderOpen, Save, FolderInput, FilePlus, Download, Upload } from "lucide-react";

interface TitleBarProps {
  onSaveToLocal?: () => void;
  onOpenLocalFolder?: () => void;
  onImportProject?: () => void;
  onNewFile?: () => void;
}

const TitleBar = ({ onSaveToLocal, onOpenLocalFolder, onImportProject, onNewFile }: TitleBarProps) => {
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between h-8 bg-vscode-titlebar border-b border-border select-none">
      <div className="flex items-center gap-2 px-3">
        <Code2 size={16} className="text-primary" />
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <div className="relative" ref={menuRef}>
            <span
              className={`hover:text-foreground cursor-pointer px-1 rounded ${fileMenuOpen ? "bg-accent text-foreground" : ""}`}
              onClick={() => setFileMenuOpen(!fileMenuOpen)}
            >
              File
            </span>
            {fileMenuOpen && (
              <div className="absolute top-full left-0 mt-0.5 w-64 bg-popover border border-border rounded shadow-lg z-50 py-1">
                <button
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-foreground hover:bg-accent text-left"
                  onClick={() => { onNewFile?.(); setFileMenuOpen(false); }}
                >
                  <FilePlus size={14} className="text-muted-foreground" />
                  New File
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-foreground hover:bg-accent text-left"
                  onClick={() => { onOpenLocalFolder?.(); setFileMenuOpen(false); }}
                >
                  <FolderOpen size={14} className="text-muted-foreground" />
                  Open Folder...
                  <span className="ml-auto text-muted-foreground text-xs">Ctrl+O</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-foreground hover:bg-accent text-left"
                  onClick={() => { onImportProject?.(); setFileMenuOpen(false); }}
                >
                  <Upload size={14} className="text-muted-foreground" />
                  Import from ZIP...
                </button>
                <div className="border-t border-border my-1" />
                <button
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-[13px] text-foreground hover:bg-accent text-left"
                  onClick={() => { onSaveToLocal?.(); setFileMenuOpen(false); }}
                >
                  <Download size={14} className="text-muted-foreground" />
                  Export as ZIP
                  <span className="ml-auto text-muted-foreground text-xs">Ctrl+S</span>
                </button>
              </div>
            )}
          </div>
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
