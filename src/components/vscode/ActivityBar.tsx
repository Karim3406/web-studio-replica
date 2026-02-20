import { useState } from "react";
import {
  Files,
  Search,
  GitBranch,
  Bug,
  Blocks,
  Settings,
  User,
} from "lucide-react";

interface ActivityBarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

const topIcons = [
  { id: "explorer", icon: Files, label: "Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "git", icon: GitBranch, label: "Source Control" },
  { id: "debug", icon: Bug, label: "Run and Debug" },
  { id: "extensions", icon: Blocks, label: "Extensions" },
];

const bottomIcons = [
  { id: "account", icon: User, label: "Account" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const ActivityBar = ({ activePanel, onPanelChange }: ActivityBarProps) => {
  return (
    <div className="flex flex-col items-center justify-between w-12 bg-vscode-activitybar border-r border-border py-1 select-none">
      <div className="flex flex-col items-center gap-0.5">
        {topIcons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onPanelChange(activePanel === id ? "" : id)}
            title={label}
            className={`relative w-12 h-12 flex items-center justify-center transition-colors ${
              activePanel === id
                ? "text-vscode-activitybar-foreground"
                : "text-vscode-activitybar-inactive hover:text-vscode-activitybar-foreground"
            }`}
          >
            {activePanel === id && (
              <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-vscode-activitybar-foreground rounded-r" />
            )}
            <Icon size={24} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5">
        {bottomIcons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            className="w-12 h-12 flex items-center justify-center text-vscode-activitybar-inactive hover:text-vscode-activitybar-foreground transition-colors"
          >
            <Icon size={24} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityBar;
