import { useState, useCallback, useMemo } from "react";
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
    try {
      if (!("showDirectoryPicker" in window)) {
        toast.error("Your browser doesn't support the File System Access API. Please use Chrome or Edge.");
        return;
      }
      const dirHandle = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      
      const writeFileToDir = async (handle: any, path: string[], fileName: string, content: string) => {
        let current = handle;
        for (const dir of path) {
          current = await current.getDirectoryHandle(dir, { create: true });
        }
        const fileHandle = await current.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      };

      const writeTree = async (nodes: FileNode[], parentPath: string[]) => {
        for (const node of nodes) {
          if (node.type === "folder" && node.children) {
            await writeTree(node.children, [...parentPath, node.name]);
          } else if (node.type === "file" && files[node.name]) {
            await writeFileToDir(dirHandle, parentPath, node.name, files[node.name].content);
          }
        }
      };

      await writeTree(fileTree, []);
      toast.success(`Project saved to "${dirHandle.name}" successfully!`);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to save project: " + err.message);
      }
    }
  }, [files, fileTree]);

  const handleOpenLocalFolder = useCallback(async () => {
    try {
      if (!("showDirectoryPicker" in window)) {
        toast.error("Your browser doesn't support the File System Access API. Please use Chrome or Edge.");
        return;
      }
      const dirHandle = await (window as any).showDirectoryPicker({ mode: "read" });

      const newFiles: Record<string, FileData> = {};
      const newTree: FileNode[] = [];

      const langMap: Record<string, string> = {
        tsx: "tsx", ts: "ts", jsx: "tsx", js: "ts",
        json: "json", css: "css", md: "md", html: "html",
        svg: "svg", ico: "ico", txt: "text",
      };

      const readDir = async (handle: any, treeArr: FileNode[]) => {
        for await (const entry of handle.values()) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            const ext = file.name.split(".").pop() || "";
            // Skip binary files
            if (["png", "jpg", "jpeg", "gif", "webp", "woff", "woff2", "ttf", "otf", "eot", "ico", "mp3", "mp4"].includes(ext)) {
              treeArr.push({ name: file.name, type: "file", language: langMap[ext] || "text" });
              continue;
            }
            try {
              const content = await file.text();
              const language = langMap[ext] || "text";
              newFiles[file.name] = { content, language };
              treeArr.push({ name: file.name, type: "file", language });
            } catch {
              // skip unreadable files
            }
          } else if (entry.kind === "directory") {
            // Skip common non-essential dirs
            if (["node_modules", ".git", "dist", ".next", ".cache"].includes(entry.name)) continue;
            const children: FileNode[] = [];
            await readDir(entry, children);
            treeArr.push({ name: entry.name, type: "folder", children });
          }
        }
      };

      await readDir(dirHandle, newTree);
      setFiles(newFiles);
      setFileTree(newTree);
      setTabs([]);
      setActiveTab("");
      toast.success(`Opened folder "${dirHandle.name}" with ${Object.keys(newFiles).length} files`);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to open folder: " + err.message);
      }
    }
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
      <TitleBar
        onSaveToLocal={handleSaveToLocal}
        onOpenLocalFolder={handleOpenLocalFolder}
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
