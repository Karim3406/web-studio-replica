import { useState, useCallback } from "react";
import {
  GitBranch,
  GitCommit,
  Plus,
  Minus,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  CloudUpload,
  CloudDownload,
  Github,
  Globe,
  X,
  FileCode,
  FilePlus,
  FileX,
  FileEdit,
} from "lucide-react";
import { FileData } from "@/data/defaultFiles";

interface Change {
  fileName: string;
  type: "modified" | "added" | "deleted";
}

interface SourceControlPanelProps {
  files: Record<string, FileData>;
  modifiedFiles: Set<string>;
}

const SourceControlPanel = ({ files, modifiedFiles }: SourceControlPanelProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");
  const [branch, setBranch] = useState("main");
  const [commitMessage, setCommitMessage] = useState("");
  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
  const [showBranches, setShowBranches] = useState(false);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [changesCollapsed, setChangesCollapsed] = useState(false);
  const [stagedCollapsed, setStagedCollapsed] = useState(false);
  const [commitHistory, setCommitHistory] = useState<
    { message: string; hash: string; date: string }[]
  >([
    { message: "Initial commit", hash: "a1b2c3d", date: "2 days ago" },
    { message: "Add component structure", hash: "e4f5g6h", date: "1 day ago" },
    { message: "Update styles and layout", hash: "i7j8k9l", date: "5 hours ago" },
  ]);

  const branches = ["main", "develop", "feature/auth", "feature/ui-update", "bugfix/header"];

  const unstagedChanges: Change[] = Array.from(modifiedFiles)
    .filter((f) => !stagedFiles.has(f))
    .map((f) => ({ fileName: f, type: "modified" as const }));

  const staged: Change[] = Array.from(stagedFiles).map((f) => ({
    fileName: f,
    type: "modified" as const,
  }));

  const stageFile = useCallback((fileName: string) => {
    setStagedFiles((prev) => new Set(prev).add(fileName));
  }, []);

  const unstageFile = useCallback((fileName: string) => {
    setStagedFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileName);
      return next;
    });
  }, []);

  const stageAll = useCallback(() => {
    setStagedFiles(new Set(modifiedFiles));
  }, [modifiedFiles]);

  const unstageAll = useCallback(() => {
    setStagedFiles(new Set());
  }, []);

  const handleCommit = useCallback(() => {
    if (!commitMessage.trim() || stagedFiles.size === 0) return;
    const hash = Math.random().toString(36).substring(2, 9);
    setCommitHistory((prev) => [
      { message: commitMessage, hash, date: "Just now" },
      ...prev,
    ]);
    setStagedFiles(new Set());
    setCommitMessage("");
  }, [commitMessage, stagedFiles]);

  const handleConnect = useCallback(() => {
    if (!repoUrl.trim()) return;
    const name = repoUrl.split("/").pop()?.replace(".git", "") || "my-repo";
    setRepoName(name);
    setIsConnected(true);
    setShowConnectForm(false);
  }, [repoUrl]);

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "modified": return <FileEdit size={14} className="text-syntax-variable shrink-0" />;
      case "added": return <FilePlus size={14} className="text-syntax-string shrink-0" />;
      case "deleted": return <FileX size={14} className="text-destructive shrink-0" />;
      default: return <FileCode size={14} className="text-muted-foreground shrink-0" />;
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case "modified": return "M";
      case "added": return "U";
      case "deleted": return "D";
      default: return "?";
    }
  };

  const getChangeLabelColor = (type: string) => {
    switch (type) {
      case "modified": return "text-syntax-variable";
      case "added": return "text-syntax-string";
      case "deleted": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  // Not connected state
  if (!isConnected && !showConnectForm) {
    return (
      <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
        <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
          Source Control
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3">
          <Github size={48} className="text-muted-foreground opacity-50" />
          <p className="text-xs text-muted-foreground text-center">
            Connect a GitHub repository to track changes and collaborate.
          </p>
          <button
            onClick={() => setShowConnectForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Github size={14} />
            Connect to GitHub
          </button>
          <button
            onClick={() => {
              setRepoName("my-project");
              setIsConnected(true);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Initialize local repository
          </button>
        </div>
      </div>
    );
  }

  // Connect form
  if (!isConnected && showConnectForm) {
    return (
      <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
        <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center justify-between">
          Connect Repository
          <button onClick={() => setShowConnectForm(false)} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>
        <div className="px-3 flex flex-col gap-3 mt-2">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Repository URL</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full bg-vscode-input border border-vscode-input-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full bg-vscode-input border border-vscode-input-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={!repoUrl.trim()}
            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Globe size={14} />
            Clone & Connect
          </button>
          <div className="border-t border-border pt-3">
            <p className="text-[10px] text-muted-foreground mb-2">Or connect with:</p>
            <button
              onClick={() => {
                setRepoUrl("https://github.com/user/my-project");
                handleConnect();
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-foreground hover:bg-accent/50 transition-colors"
            >
              <Github size={14} />
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected state
  return (
    <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center justify-between">
        Source Control
        <div className="flex items-center gap-1">
          <button title="Refresh" className="text-muted-foreground hover:text-foreground p-0.5">
            <RefreshCw size={12} />
          </button>
          <button title="More Actions" className="text-muted-foreground hover:text-foreground p-0.5">
            <MoreHorizontal size={12} />
          </button>
        </div>
      </div>

      {/* Repo info */}
      <div className="px-3 pb-2 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-foreground mb-1">
          <Github size={12} />
          <span className="truncate font-medium">{repoName}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowBranches(!showBranches)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full"
          >
            <GitBranch size={12} />
            <span>{branch}</span>
            <ChevronDown size={10} className="ml-auto" />
          </button>
          {showBranches && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded shadow-lg z-10">
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBranch(b);
                    setShowBranches(false);
                  }}
                  className={`flex items-center gap-1.5 w-full px-2 py-1 text-xs hover:bg-accent/50 ${
                    b === branch ? "text-primary" : "text-foreground"
                  }`}
                >
                  <GitBranch size={10} />
                  {b}
                  {b === branch && <Check size={10} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commit input */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1 mb-1.5">
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommit()}
            placeholder="Message (Ctrl+Enter to commit)"
            className="flex-1 bg-vscode-input border border-vscode-input-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || stagedFiles.size === 0}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[11px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={12} />
            Commit
          </button>
          <button
            title="Push"
            className="px-2 py-1 bg-accent text-accent-foreground rounded text-[11px] hover:opacity-90"
          >
            <CloudUpload size={12} />
          </button>
          <button
            title="Pull"
            className="px-2 py-1 bg-accent text-accent-foreground rounded text-[11px] hover:opacity-90"
          >
            <CloudDownload size={12} />
          </button>
        </div>
      </div>

      {/* Changes */}
      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes */}
        {staged.length > 0 && (
          <div>
            <button
              onClick={() => setStagedCollapsed(!stagedCollapsed)}
              className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider"
            >
              {stagedCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              Staged Changes
              <span className="ml-auto bg-primary/20 text-primary rounded-full px-1.5 text-[10px] font-normal normal-case">
                {staged.length}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); unstageAll(); }}
                title="Unstage All"
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <Minus size={12} />
              </button>
            </button>
            {!stagedCollapsed &&
              staged.map((change) => (
                <div
                  key={change.fileName}
                  className="flex items-center gap-1.5 px-5 py-0.5 text-xs hover:bg-accent/30 group"
                >
                  {getChangeIcon(change.type)}
                  <span className="truncate flex-1 text-foreground">{change.fileName}</span>
                  <span className={`text-[10px] ${getChangeLabelColor(change.type)}`}>
                    {getChangeLabel(change.type)}
                  </span>
                  <button
                    onClick={() => unstageFile(change.fileName)}
                    title="Unstage"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                  >
                    <Minus size={12} />
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Unstaged Changes */}
        <div>
          <button
            onClick={() => setChangesCollapsed(!changesCollapsed)}
            className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider"
          >
            {changesCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            Changes
            <span className="ml-auto bg-accent text-muted-foreground rounded-full px-1.5 text-[10px] font-normal normal-case">
              {unstagedChanges.length}
            </span>
            {unstagedChanges.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); stageAll(); }}
                title="Stage All"
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <Plus size={12} />
              </button>
            )}
          </button>
          {!changesCollapsed && unstagedChanges.length === 0 && (
            <p className="px-5 py-2 text-[11px] text-muted-foreground">No changes detected.</p>
          )}
          {!changesCollapsed &&
            unstagedChanges.map((change) => (
              <div
                key={change.fileName}
                className="flex items-center gap-1.5 px-5 py-0.5 text-xs hover:bg-accent/30 group"
              >
                {getChangeIcon(change.type)}
                <span className="truncate flex-1 text-foreground">{change.fileName}</span>
                <span className={`text-[10px] ${getChangeLabelColor(change.type)}`}>
                  {getChangeLabel(change.type)}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                  <button
                    onClick={() => stageFile(change.fileName)}
                    title="Stage"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus size={12} />
                  </button>
                  <button title="Discard" className="text-muted-foreground hover:text-destructive">
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Recent Commits */}
        <div className="border-t border-border mt-2">
          <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Commits
          </div>
          {commitHistory.map((commit) => (
            <div
              key={commit.hash}
              className="flex items-start gap-1.5 px-3 py-1 text-xs hover:bg-accent/30 cursor-pointer"
            >
              <GitCommit size={12} className="text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate">{commit.message}</p>
                <p className="text-[10px] text-muted-foreground">
                  <span className="text-primary">{commit.hash}</span> · {commit.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SourceControlPanel;
