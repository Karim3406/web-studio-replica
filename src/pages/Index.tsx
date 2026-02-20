import { useState, useCallback } from "react";
import TitleBar from "@/components/vscode/TitleBar";
import ActivityBar from "@/components/vscode/ActivityBar";
import FileExplorer from "@/components/vscode/FileExplorer";
import SearchPanel from "@/components/vscode/SearchPanel";
import EditorTabs from "@/components/vscode/EditorTabs";
import Breadcrumbs from "@/components/vscode/Breadcrumbs";
import CodeEditor from "@/components/vscode/CodeEditor";
import Terminal from "@/components/vscode/Terminal";
import StatusBar from "@/components/vscode/StatusBar";

interface Tab {
  name: string;
  modified?: boolean;
}

const Index = () => {
  const [activePanel, setActivePanel] = useState("explorer");
  const [tabs, setTabs] = useState<Tab[]>([
    { name: "App.tsx", modified: true },
    { name: "main.tsx" },
    { name: "types.ts" },
  ]);
  const [activeTab, setActiveTab] = useState("App.tsx");
  const [terminalOpen, setTerminalOpen] = useState(true);

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

  const renderSidePanel = () => {
    switch (activePanel) {
      case "explorer":
        return <FileExplorer onFileSelect={handleFileSelect} activeFile={activeTab} />;
      case "search":
        return <SearchPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TitleBar />
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
          <CodeEditor fileName={activeTab} />
          <Terminal isOpen={terminalOpen} onToggle={() => setTerminalOpen(!terminalOpen)} />
        </div>
      </div>
      <StatusBar fileName={activeTab || "Untitled"} />
    </div>
  );
};

export default Index;
