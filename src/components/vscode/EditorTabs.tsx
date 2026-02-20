import { X, FileCode, FileJson, FileText } from "lucide-react";

interface Tab {
  name: string;
  modified?: boolean;
}

interface EditorTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabSelect: (name: string) => void;
  onTabClose: (name: string) => void;
}

const getTabIcon = (name: string) => {
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return <FileCode size={14} className="text-syntax-keyword shrink-0" />;
  if (name.endsWith(".json"))
    return <FileJson size={14} className="text-syntax-decorator shrink-0" />;
  return <FileText size={14} className="text-foreground shrink-0" />;
};

const EditorTabs = ({ tabs, activeTab, onTabSelect, onTabClose }: EditorTabsProps) => {
  if (tabs.length === 0) return null;

  return (
    <div className="flex bg-vscode-tab-inactive border-b border-border overflow-x-auto scrollbar-thin select-none">
      {tabs.map((tab) => (
        <div
          key={tab.name}
          onClick={() => onTabSelect(tab.name)}
          className={`group flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer border-r border-border min-w-0 shrink-0 ${
            activeTab === tab.name
              ? "bg-vscode-tab-active text-foreground border-t-2 border-t-primary"
              : "text-muted-foreground hover:bg-accent/30"
          }`}
          style={{ borderTopWidth: activeTab === tab.name ? 2 : 0 }}
        >
          {getTabIcon(tab.name)}
          <span className="truncate text-[13px]">{tab.name}</span>
          {tab.modified && (
            <span className="w-2 h-2 rounded-full bg-foreground shrink-0" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.name);
            }}
            className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded p-0.5 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;
