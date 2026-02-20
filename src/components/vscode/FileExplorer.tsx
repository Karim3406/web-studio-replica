import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileCode,
  FileJson,
  Image,
  FolderOpen,
  Folder,
  Plus,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { FileNode } from "@/data/defaultFileTree";

const getFileIcon = (name: string) => {
  if (name.endsWith(".tsx") || name.endsWith(".ts") || name.endsWith(".jsx") || name.endsWith(".js"))
    return <FileCode size={16} className="text-syntax-keyword shrink-0" />;
  if (name.endsWith(".json"))
    return <FileJson size={16} className="text-syntax-decorator shrink-0" />;
  if (name.endsWith(".css"))
    return <FileText size={16} className="text-syntax-tag shrink-0" />;
  if (name.endsWith(".svg") || name.endsWith(".ico") || name.endsWith(".png"))
    return <Image size={16} className="text-syntax-string shrink-0" />;
  return <FileText size={16} className="text-foreground shrink-0" />;
};

interface FileExplorerProps {
  fileTree: FileNode[];
  onFileSelect: (fileName: string) => void;
  activeFile: string;
  onCreateFile: (fileName: string, parentPath: string[]) => void;
  onDeleteFile: (fileName: string) => void;
}

const FileTreeItem = ({
  node,
  depth,
  onFileSelect,
  activeFile,
  onDeleteFile,
  onCreateFile,
  parentPath,
}: {
  node: FileNode;
  depth: number;
  onFileSelect: (name: string) => void;
  activeFile: string;
  onDeleteFile: (name: string) => void;
  onCreateFile: (fileName: string, parentPath: string[]) => void;
  parentPath: string[];
}) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const [creating, setCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creating]);

  const handleCreateSubmit = () => {
    const trimmed = newFileName.trim();
    if (trimmed) {
      onCreateFile(trimmed, [...parentPath, node.name]);
    }
    setCreating(false);
    setNewFileName("");
  };

  if (node.type === "folder") {
    return (
      <div>
        <div className="group flex items-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center flex-1 py-[2px] hover:bg-accent/50 text-sm cursor-pointer"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {expanded ? (
              <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
            )}
            {expanded ? (
              <FolderOpen size={16} className="ml-1 mr-1.5 shrink-0 text-syntax-decorator" />
            ) : (
              <Folder size={16} className="ml-1 mr-1.5 shrink-0 text-syntax-decorator" />
            )}
            <span className="truncate text-vscode-sidebar-foreground">{node.name}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
              setCreating(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded mr-1"
            title="New File"
          >
            <Plus size={14} className="text-muted-foreground" />
          </button>
        </div>
        {expanded && (
          <>
            {creating && (
              <div className="flex items-center py-[2px]" style={{ paddingLeft: `${(depth + 1) * 16 + 28}px` }}>
                <input
                  ref={inputRef}
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSubmit();
                    if (e.key === "Escape") { setCreating(false); setNewFileName(""); }
                  }}
                  onBlur={handleCreateSubmit}
                  className="bg-vscode-input border border-vscode-input-border text-foreground text-sm px-1 py-0 outline-none w-full rounded-sm"
                  placeholder="filename.ts"
                />
              </div>
            )}
            {node.children?.map((child) => (
              <FileTreeItem
                key={child.name}
                node={child}
                depth={depth + 1}
                onFileSelect={onFileSelect}
                activeFile={activeFile}
                onDeleteFile={onDeleteFile}
                onCreateFile={onCreateFile}
                parentPath={[...parentPath, node.name]}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center">
      <button
        onClick={() => onFileSelect(node.name)}
        className={`flex items-center flex-1 py-[2px] text-sm cursor-pointer ${
          activeFile === node.name
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent/50 text-vscode-sidebar-foreground"
        }`}
        style={{ paddingLeft: `${depth * 16 + 28}px` }}
      >
        {getFileIcon(node.name)}
        <span className="ml-1.5 truncate">{node.name}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteFile(node.name);
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/20 rounded mr-1"
        title="Delete File"
      >
        <Trash2 size={14} className="text-destructive" />
      </button>
    </div>
  );
};

const FileExplorer = ({ fileTree, onFileSelect, activeFile, onCreateFile, onDeleteFile }: FileExplorerProps) => {
  const [explorerExpanded, setExplorerExpanded] = useState(true);
  const [creatingRoot, setCreatingRoot] = useState(false);
  const [newRootFileName, setNewRootFileName] = useState("");
  const rootInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingRoot && rootInputRef.current) {
      rootInputRef.current.focus();
    }
  }, [creatingRoot]);

  const handleRootCreateSubmit = () => {
    const trimmed = newRootFileName.trim();
    if (trimmed) {
      onCreateFile(trimmed, []);
    }
    setCreatingRoot(false);
    setNewRootFileName("");
  };

  return (
    <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center justify-between">
        <span>Explorer</span>
        <button
          onClick={() => setCreatingRoot(true)}
          className="hover:bg-accent rounded p-0.5"
          title="New File"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <button
          onClick={() => setExplorerExpanded(!explorerExpanded)}
          className="flex items-center w-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider hover:bg-accent/50"
        >
          {explorerExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="ml-1">my-project</span>
        </button>
        {explorerExpanded && (
          <>
            {creatingRoot && (
              <div className="flex items-center py-[2px] px-6">
                <input
                  ref={rootInputRef}
                  value={newRootFileName}
                  onChange={(e) => setNewRootFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRootCreateSubmit();
                    if (e.key === "Escape") { setCreatingRoot(false); setNewRootFileName(""); }
                  }}
                  onBlur={handleRootCreateSubmit}
                  className="bg-vscode-input border border-vscode-input-border text-foreground text-sm px-1 py-0 outline-none w-full rounded-sm"
                  placeholder="filename.ts"
                />
              </div>
            )}
            {fileTree.map((node) => (
              <FileTreeItem
                key={node.name}
                node={node}
                depth={0}
                onFileSelect={onFileSelect}
                activeFile={activeFile}
                onDeleteFile={onDeleteFile}
                onCreateFile={onCreateFile}
                parentPath={[]}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
