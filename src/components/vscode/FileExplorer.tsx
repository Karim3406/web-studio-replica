import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileCode,
  FileJson,
  Image,
  FolderOpen,
  Folder,
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
}

const fileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "components",
        type: "folder",
        children: [
          { name: "App.tsx", type: "file", language: "tsx" },
          { name: "Header.tsx", type: "file", language: "tsx" },
          { name: "Sidebar.tsx", type: "file", language: "tsx" },
          { name: "Button.tsx", type: "file", language: "tsx" },
        ],
      },
      {
        name: "hooks",
        type: "folder",
        children: [
          { name: "useTheme.ts", type: "file", language: "ts" },
          { name: "useAuth.ts", type: "file", language: "ts" },
        ],
      },
      {
        name: "styles",
        type: "folder",
        children: [
          { name: "globals.css", type: "file", language: "css" },
          { name: "components.css", type: "file", language: "css" },
        ],
      },
      { name: "index.tsx", type: "file", language: "tsx" },
      { name: "main.tsx", type: "file", language: "tsx" },
      { name: "types.ts", type: "file", language: "ts" },
    ],
  },
  {
    name: "public",
    type: "folder",
    children: [
      { name: "favicon.ico", type: "file", language: "ico" },
      { name: "logo.svg", type: "file", language: "svg" },
    ],
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
  { name: "README.md", type: "file", language: "md" },
  { name: ".gitignore", type: "file", language: "text" },
];

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
  onFileSelect: (fileName: string) => void;
  activeFile: string;
}

const FileTreeItem = ({
  node,
  depth,
  onFileSelect,
  activeFile,
}: {
  node: FileNode;
  depth: number;
  onFileSelect: (name: string) => void;
  activeFile: string;
}) => {
  const [expanded, setExpanded] = useState(depth < 1);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center w-full py-[2px] hover:bg-accent/50 text-sm cursor-pointer group"
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
        {expanded &&
          node.children?.map((child) => (
            <FileTreeItem
              key={child.name}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileSelect(node.name)}
      className={`flex items-center w-full py-[2px] text-sm cursor-pointer ${
        activeFile === node.name
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-vscode-sidebar-foreground"
      }`}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      {getFileIcon(node.name)}
      <span className="ml-1.5 truncate">{node.name}</span>
    </button>
  );
};

const FileExplorer = ({ onFileSelect, activeFile }: FileExplorerProps) => {
  const [explorerExpanded, setExplorerExpanded] = useState(true);

  return (
    <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <button
          onClick={() => setExplorerExpanded(!explorerExpanded)}
          className="flex items-center w-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider hover:bg-accent/50"
        >
          {explorerExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="ml-1">my-project</span>
        </button>
        {explorerExpanded &&
          fileTree.map((node) => (
            <FileTreeItem
              key={node.name}
              node={node}
              depth={0}
              onFileSelect={onFileSelect}
              activeFile={activeFile}
            />
          ))}
      </div>
    </div>
  );
};

export default FileExplorer;
