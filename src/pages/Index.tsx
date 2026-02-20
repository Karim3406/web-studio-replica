import { useState, useCallback, useMemo, useRef } from "react";
import JSZip from "jszip";
import { toast } from "sonner";
import TitleBar from "@/components/vscode/TitleBar";
import ActivityBar from "@/components/vscode/ActivityBar";
import FileExplorer from "@/components/vscode/FileExplorer";
import SearchPanel from "@/components/vscode/SearchPanel";
import SourceControlPanel from "@/components/vscode/SourceControlPanel";
import DebugPanel from "@/components/vscode/DebugPanel";
import EditorTabs from "@/components/vscode/EditorTabs";
import Breadcrumbs from "@/components/vscode/Breadcrumbs";
import CodeEditor from "@/components/vscode/CodeEditor";
import Terminal from "@/components/vscode/Terminal";
import StatusBar from "@/components/vscode/StatusBar";
import { defaultFileContents, FileData } from "@/data/defaultFiles";
import { FileNode, defaultFileTree } from "@/data/defaultFileTree";

interface Tab {
  name: string;
  modified?: boolean;
}

const Index = () => {
  const [activePanel, setActivePanel] = useState("explorer");
  const [tabs, setTabs] = useState<Tab[]>([
    { name: "App.tsx", modified: false },
    { name: "main.tsx" },
    { name: "types.ts" },
  ]);
  const [activeTab, setActiveTab] = useState("App.tsx");
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [files, setFiles] = useState<Record<string, FileData>>(defaultFileContents);
  const [fileTree, setFileTree] = useState<FileNode[]>(defaultFileTree);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  const modifiedFiles = useMemo(() => {
    return new Set(tabs.filter((t) => t.modified).map((t) => t.name));
  }, [tabs]);

  const handleFileSelect = useCallback(
    (fileName: string) => {
      if (!tabs.find((t) => t.name === fileName)) {
        setTabs((prev) => [...prev, { name: fileName }]);
      }
      setActiveTab(fileName);
    },
    [tabs]
  );

  const handleTabClose = useCallback(
    (fileName: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.name !== fileName);
        if (activeTab === fileName && next.length > 0) {
          setActiveTab(next[next.length - 1].name);
        }
        if (next.length === 0) setActiveTab("");
        return next;
      });
    },
    [activeTab]
  );

  const handleFileContentChange = useCallback((fileName: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        content,
      },
    }));
    setTabs((prev) =>
      prev.map((t) => (t.name === fileName ? { ...t, modified: true } : t))
    );
  }, []);

  const handleCreateFile = useCallback((fileName: string, parentPath: string[]) => {
    const ext = fileName.split(".").pop() || "";
    const langMap: Record<string, string> = {
      tsx: "tsx", ts: "ts", jsx: "tsx", js: "ts",
      json: "json", css: "css", md: "md", html: "html",
    };
    const language = langMap[ext] || "text";

    setFiles((prev) => ({
      ...prev,
      [fileName]: { content: "", language },
    }));

    setFileTree((prev) => {
      const addToTree = (nodes: FileNode[], path: string[]): FileNode[] => {
        if (path.length === 0) {
          return [...nodes, { name: fileName, type: "file", language }];
        }
        return nodes.map((node) => {
          if (node.type === "folder" && node.name === path[0]) {
            return {
              ...node,
              children: addToTree(node.children || [], path.slice(1)),
            };
          }
          return node;
        });
      };
      return addToTree(prev, parentPath);
    });

    if (!tabs.find((t) => t.name === fileName)) {
      setTabs((prev) => [...prev, { name: fileName }]);
    }
    setActiveTab(fileName);
  }, [tabs]);

  const handleDeleteFile = useCallback((fileName: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });

    setFileTree((prev) => {
      const removeFromTree = (nodes: FileNode[]): FileNode[] => {
        return nodes
          .filter((node) => node.name !== fileName)
          .map((node) => {
            if (node.type === "folder" && node.children) {
              return { ...node, children: removeFromTree(node.children) };
            }
            return node;
          });
      };
      return removeFromTree(prev);
    });

    setTabs((prev) => {
      const next = prev.filter((t) => t.name !== fileName);
      if (activeTab === fileName && next.length > 0) {
        setActiveTab(next[next.length - 1].name);
      } else if (next.length === 0) {
        setActiveTab("");
      }
      return next;
    });
  }, [activeTab]);

  const handleCursorChange = useCallback((line: number, col: number) => {
    setCursorPos({ line, col });
  }, []);

  const handleSaveToLocal = useCallback(async () => {
    const zip = new JSZip();

    const addToZip = (nodes: FileNode[], parentPath: string) => {
      for (const node of nodes) {
        if (node.type === "folder" && node.children) {
          addToZip(node.children, parentPath ? `${parentPath}/${node.name}` : node.name);
        } else if (node.type === "file" && files[node.name]) {
          const filePath = parentPath ? `${parentPath}/${node.name}` : node.name;
          zip.file(filePath, files[node.name].content);
        }
      }
    };
    addToZip(fileTree, "");

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project exported as ZIP — unzip and open in VS Code!");
  }, [files, fileTree]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenLocalFolder = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFolderSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;

    const langMap: Record<string, string> = {
      tsx: "tsx", ts: "ts", jsx: "tsx", js: "ts",
      json: "json", css: "css", md: "md", html: "html",
      svg: "svg", ico: "ico", txt: "text",
    };
    const binaryExts = ["png", "jpg", "jpeg", "gif", "webp", "woff", "woff2", "ttf", "otf", "eot", "ico", "mp3", "mp4"];
    const skipDirs = ["node_modules", ".git", "dist", ".next", ".cache"];

    const newFiles: Record<string, FileData> = {};
    const treeMap = new Map<string, FileNode>();
    const rootChildren: FileNode[] = [];
    let pending = 0;
    let total = 0;

    Array.from(inputFiles).forEach((file) => {
      const path = (file as any).webkitRelativePath || file.name;
      const parts = path.split("/");
      if (parts.length > 1) parts.shift();
      if (parts.some((p: string) => skipDirs.includes(p))) return;

      const fileName = parts[parts.length - 1];
      const ext = fileName.split(".").pop() || "";

      let currentChildren = rootChildren;
      for (let i = 0; i < parts.length - 1; i++) {
        const dirName = parts[i];
        const key = parts.slice(0, i + 1).join("/");
        if (!treeMap.has(key)) {
          const folder: FileNode = { name: dirName, type: "folder", children: [] };
          treeMap.set(key, folder);
          currentChildren.push(folder);
        }
        currentChildren = treeMap.get(key)!.children!;
      }

      const language = langMap[ext] || "text";
      currentChildren.push({ name: fileName, type: "file", language });

      if (binaryExts.includes(ext)) return;

      pending++;
      total++;
      const reader = new FileReader();
      reader.onload = () => {
        newFiles[fileName] = { content: reader.result as string, language };
        pending--;
        if (pending === 0) {
          setFiles(newFiles);
          setFileTree(rootChildren);
          setTabs([]);
          setActiveTab("");
          toast.success(`Opened ${Object.keys(newFiles).length} files`);
        }
      };
      reader.readAsText(file);
    });

    if (total === 0) {
      setFileTree(rootChildren);
      setFiles({});
      setTabs([]);
      setActiveTab("");
      toast.info("No readable text files found");
    }
    e.target.value = "";
  }, []);

  const handleImportProject = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const zip = await JSZip.loadAsync(file);
        const langMap: Record<string, string> = {
          tsx: "tsx", ts: "ts", jsx: "tsx", js: "ts",
          json: "json", css: "css", md: "md", html: "html",
          svg: "svg", txt: "text",
        };
        const binaryExts = ["png", "jpg", "jpeg", "gif", "webp", "woff", "woff2", "ttf", "otf", "eot", "ico", "mp3", "mp4"];
        const skipDirs = ["node_modules", ".git", "dist", ".next", ".cache"];

        const newFiles: Record<string, FileData> = {};
        const newTree: FileNode[] = [];
        const folderMap = new Map<string, FileNode>();

        const entries = Object.keys(zip.files).filter(p => !zip.files[p].dir);

        for (const fullPath of entries) {
          const parts = fullPath.split("/").filter(Boolean);
          if (parts.some(p => skipDirs.includes(p))) continue;

          const fileName = parts[parts.length - 1];
          const ext = fileName.split(".").pop() || "";
          if (binaryExts.includes(ext)) continue;

          const language = langMap[ext] || "text";
          const content = await zip.files[fullPath].async("string");
          newFiles[fileName] = { content, language };

          let currentChildren = newTree;
          for (let i = 0; i < parts.length - 1; i++) {
            const key = parts.slice(0, i + 1).join("/");
            if (!folderMap.has(key)) {
              const folder: FileNode = { name: parts[i], type: "folder", children: [] };
              folderMap.set(key, folder);
              currentChildren.push(folder);
            }
            currentChildren = folderMap.get(key)!.children!;
          }
          currentChildren.push({ name: fileName, type: "file", language });
        }

        setFiles(newFiles);
        setFileTree(newTree);
        setTabs([]);
        setActiveTab("");
        toast.success(`Imported ${Object.keys(newFiles).length} files from ZIP`);
      } catch {
        toast.error("Failed to read ZIP file");
      }
    };
    input.click();
  }, []);

  const renderSidePanel = () => {
    switch (activePanel) {
      case "explorer":
        return (
          <FileExplorer
            fileTree={fileTree}
            onFileSelect={handleFileSelect}
            activeFile={activeTab}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        );
      case "search":
        return (
          <SearchPanel
            files={files}
            onFileSelect={handleFileSelect}
            onReplaceInFile={(fileName, search, replace, all) => {
              const file = files[fileName];
              if (!file) return;
              const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), all ? "g" : "");
              handleFileContentChange(fileName, file.content.replace(regex, replace));
            }}
          />
        );
      case "git":
        return <SourceControlPanel files={files} modifiedFiles={modifiedFiles} />;
      case "debug":
        return <DebugPanel files={files} activeFile={activeTab} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        {...({ webkitdirectory: "", directory: "", multiple: true } as any)}
        onChange={handleFolderSelected}
      />
      <TitleBar
        onSaveToLocal={handleSaveToLocal}
        onOpenLocalFolder={handleOpenLocalFolder}
        onImportProject={handleImportProject}
        onNewFile={() => handleCreateFile("untitled.ts", [])}
      />
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />
        {activePanel && renderSidePanel()}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabSelect={setActiveTab}
            onTabClose={handleTabClose}
          />
          {activeTab && <Breadcrumbs fileName={activeTab} />}
          <CodeEditor
            fileName={activeTab}
            fileData={files[activeTab] || null}
            onContentChange={handleFileContentChange}
            onCursorChange={handleCursorChange}
          />
          <Terminal isOpen={terminalOpen} onToggle={() => setTerminalOpen(!terminalOpen)} />
        </div>
      </div>
      <StatusBar fileName={activeTab || "Untitled"} line={cursorPos.line} column={cursorPos.col} />
    </div>
  );
};

export default Index;
