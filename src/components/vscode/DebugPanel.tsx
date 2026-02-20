import { useState, useCallback } from "react";
import {
  Play,
  Pause,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Circle,
  Bug,
  Terminal as TerminalIcon,
  AlertTriangle,
  Info,
  XCircle,
} from "lucide-react";
import { FileData } from "@/data/defaultFiles";

type DebugStatus = "idle" | "running" | "paused" | "stopped";

interface Breakpoint {
  id: string;
  fileName: string;
  line: number;
  enabled: boolean;
}

interface WatchExpression {
  id: string;
  expression: string;
  value: string;
}

interface ConsoleEntry {
  id: string;
  type: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: string;
}

interface CallStackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
}

interface DebugPanelProps {
  files: Record<string, FileData>;
  activeFile: string;
}

const DebugPanel = ({ files, activeFile }: DebugPanelProps) => {
  const [status, setStatus] = useState<DebugStatus>("idle");
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { id: "bp1", fileName: "App.tsx", line: 20, enabled: true },
    { id: "bp2", fileName: "App.tsx", line: 27, enabled: true },
    { id: "bp3", fileName: "useAuth.ts", line: 12, enabled: false },
  ]);
  const [watchExpressions, setWatchExpressions] = useState<WatchExpression[]>([
    { id: "w1", expression: "count", value: "0" },
    { id: "w2", expression: "isOpen", value: "false" },
  ]);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [callStack, setCallStack] = useState<CallStackFrame[]>([]);
  const [variables, setVariables] = useState<{ name: string; value: string; type: string }[]>([]);
  const [newWatchExpr, setNewWatchExpr] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("Launch Chrome");
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);

  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    variables: false,
    watch: false,
    callStack: false,
    breakpoints: false,
    console: false,
  });

  const configs = ["Launch Chrome", "Launch Firefox", "Node.js", "Attach to Process", "Jest Tests"];

  const toggleSection = (key: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addLogEntry = useCallback((type: ConsoleEntry["type"], message: string) => {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setConsoleEntries((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), type, message, timestamp: ts },
    ]);
  }, []);

  const handleStart = useCallback(() => {
    setStatus("running");
    setConsoleEntries([]);
    addLogEntry("info", `Debugger attached. Config: ${selectedConfig}`);
    addLogEntry("log", "Compiling application...");

    setTimeout(() => {
      addLogEntry("log", "webpack compiled successfully in 342ms");
      addLogEntry("info", "Listening on http://localhost:3000");
    }, 600);

    setTimeout(() => {
      addLogEntry("log", "App component mounted");
      addLogEntry("log", "Initial render complete");
    }, 1200);

    // Simulate hitting a breakpoint
    setTimeout(() => {
      const enabledBp = breakpoints.find((bp) => bp.enabled);
      if (enabledBp) {
        setStatus("paused");
        addLogEntry("warn", `Paused on breakpoint at ${enabledBp.fileName}:${enabledBp.line}`);
        setCallStack([
          { id: "f1", name: "handleIncrement", file: "App.tsx", line: enabledBp.line },
          { id: "f2", name: "onClick", file: "App.tsx", line: 42 },
          { id: "f3", name: "dispatchEvent", file: "react-dom.js", line: 3941 },
          { id: "f4", name: "invokeGuardedCallbackDev", file: "react-dom.js", line: 4589 },
        ]);
        setVariables([
          { name: "count", value: "0", type: "number" },
          { name: "isOpen", value: "false", type: "boolean" },
          { name: "title", value: '"My Application"', type: "string" },
          { name: "theme", value: '"dark"', type: "string" },
          { name: "prev", value: "0", type: "number" },
          { name: "this", value: "undefined", type: "undefined" },
        ]);
        setWatchExpressions((prev) =>
          prev.map((w) => {
            if (w.expression === "count") return { ...w, value: "0" };
            if (w.expression === "isOpen") return { ...w, value: "false" };
            return w;
          })
        );
      }
    }, 2000);
  }, [breakpoints, selectedConfig, addLogEntry]);

  const handleContinue = useCallback(() => {
    setStatus("running");
    addLogEntry("info", "Resumed execution");
    setCallStack([]);
    setVariables([]);

    setTimeout(() => {
      setWatchExpressions((prev) =>
        prev.map((w) => {
          if (w.expression === "count") return { ...w, value: "1" };
          return w;
        })
      );
      addLogEntry("log", "State updated: count → 1");
    }, 500);
  }, [addLogEntry]);

  const handleStepOver = useCallback(() => {
    if (status !== "paused") return;
    addLogEntry("info", "Step over");
    setCallStack((prev) =>
      prev.length > 0
        ? [{ ...prev[0], line: prev[0].line + 1 }, ...prev.slice(1)]
        : prev
    );
    setVariables((prev) =>
      prev.map((v) => (v.name === "count" ? { ...v, value: String(Number(v.value) + 1) } : v))
    );
  }, [status, addLogEntry]);

  const handleStepInto = useCallback(() => {
    if (status !== "paused") return;
    addLogEntry("info", "Step into");
    setCallStack((prev) => [
      { id: "sf" + Math.random(), name: "setState", file: "react.js", line: 1024 },
      ...prev,
    ]);
  }, [status, addLogEntry]);

  const handleStepOut = useCallback(() => {
    if (status !== "paused") return;
    addLogEntry("info", "Step out");
    setCallStack((prev) => (prev.length > 1 ? prev.slice(1) : prev));
  }, [status, addLogEntry]);

  const handleStop = useCallback(() => {
    setStatus("stopped");
    addLogEntry("info", "Debugger disconnected.");
    setCallStack([]);
    setVariables([]);
    setTimeout(() => setStatus("idle"), 300);
  }, [addLogEntry]);

  const handleRestart = useCallback(() => {
    addLogEntry("info", "Restarting...");
    setStatus("idle");
    setCallStack([]);
    setVariables([]);
    setTimeout(handleStart, 300);
  }, [handleStart, addLogEntry]);

  const toggleBreakpoint = (id: string) => {
    setBreakpoints((prev) =>
      prev.map((bp) => (bp.id === id ? { ...bp, enabled: !bp.enabled } : bp))
    );
  };

  const removeBreakpoint = (id: string) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.id !== id));
  };

  const addWatchExpression = () => {
    if (!newWatchExpr.trim()) return;
    setWatchExpressions((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 9), expression: newWatchExpr, value: "undefined" },
    ]);
    setNewWatchExpr("");
  };

  const removeWatch = (id: string) => {
    setWatchExpressions((prev) => prev.filter((w) => w.id !== id));
  };

  const getConsoleIcon = (type: ConsoleEntry["type"]) => {
    switch (type) {
      case "error": return <XCircle size={12} className="text-destructive shrink-0" />;
      case "warn": return <AlertTriangle size={12} className="text-syntax-string shrink-0" />;
      case "info": return <Info size={12} className="text-primary shrink-0" />;
      default: return <TerminalIcon size={12} className="text-muted-foreground shrink-0" />;
    }
  };

  return (
    <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
      {/* Header with config selector */}
      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
        Run and Debug
      </div>

      {/* Debug config & controls */}
      <div className="px-3 pb-2 border-b border-border">
        <div className="relative mb-2">
          <button
            onClick={() => setShowConfigDropdown(!showConfigDropdown)}
            className="w-full flex items-center gap-1 bg-vscode-input border border-vscode-input-border rounded px-2 py-1 text-xs text-foreground"
          >
            <Bug size={12} className="text-primary shrink-0" />
            <span className="truncate flex-1 text-left">{selectedConfig}</span>
            <ChevronDown size={10} />
          </button>
          {showConfigDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded shadow-lg z-10">
              {configs.map((c) => (
                <button
                  key={c}
                  onClick={() => { setSelectedConfig(c); setShowConfigDropdown(false); }}
                  className={`w-full text-left px-2 py-1 text-xs hover:bg-accent/50 ${c === selectedConfig ? "text-primary" : "text-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          {status === "idle" || status === "stopped" ? (
            <button onClick={handleStart} title="Start Debugging (F5)" className="p-1.5 rounded bg-syntax-string/20 text-syntax-string hover:bg-syntax-string/30">
              <Play size={14} />
            </button>
          ) : status === "paused" ? (
            <button onClick={handleContinue} title="Continue (F5)" className="p-1.5 rounded bg-syntax-string/20 text-syntax-string hover:bg-syntax-string/30">
              <Play size={14} />
            </button>
          ) : (
            <button title="Pause" onClick={() => { setStatus("paused"); addLogEntry("warn", "Paused"); }} className="p-1.5 rounded bg-syntax-variable/20 text-syntax-variable hover:bg-syntax-variable/30">
              <Pause size={14} />
            </button>
          )}
          <button onClick={handleStepOver} disabled={status !== "paused"} title="Step Over (F10)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30">
            <ArrowRight size={14} />
          </button>
          <button onClick={handleStepInto} disabled={status !== "paused"} title="Step Into (F11)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30">
            <ArrowDownToLine size={14} />
          </button>
          <button onClick={handleStepOut} disabled={status !== "paused"} title="Step Out (Shift+F11)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30">
            <ArrowUpFromLine size={14} />
          </button>
          <button onClick={handleRestart} disabled={status === "idle"} title="Restart (Ctrl+Shift+F5)" className="p-1.5 rounded text-syntax-string hover:bg-syntax-string/20 disabled:opacity-30">
            <RotateCcw size={14} />
          </button>
          <button onClick={handleStop} disabled={status === "idle"} title="Stop (Shift+F5)" className="p-1.5 rounded text-destructive hover:bg-destructive/20 disabled:opacity-30">
            <Square size={14} />
          </button>
        </div>
        {status !== "idle" && (
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${status === "running" ? "bg-syntax-string animate-pulse" : status === "paused" ? "bg-syntax-variable" : "bg-muted-foreground"}`} />
            <span className="text-[10px] text-muted-foreground capitalize">{status}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Variables */}
        <div>
          <button onClick={() => toggleSection("variables")} className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider">
            {sectionsCollapsed.variables ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            Variables
          </button>
          {!sectionsCollapsed.variables && (
            <div className="px-3">
              {variables.length === 0 ? (
                <p className="text-[10px] text-muted-foreground py-1">Not available.</p>
              ) : (
                variables.map((v) => (
                  <div key={v.name} className="flex items-center gap-1 py-0.5 text-xs">
                    <span className="text-syntax-variable">{v.name}</span>
                    <span className="text-muted-foreground">=</span>
                    <span className={v.type === "string" ? "text-syntax-string" : v.type === "number" ? "text-syntax-number" : "text-syntax-keyword"}>
                      {v.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Watch */}
        <div>
          <button onClick={() => toggleSection("watch")} className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider">
            {sectionsCollapsed.watch ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            Watch
            <button onClick={(e) => { e.stopPropagation(); toggleSection("watch"); }} className="ml-auto">
              <Plus size={12} className="text-muted-foreground hover:text-foreground" />
            </button>
          </button>
          {!sectionsCollapsed.watch && (
            <div className="px-3">
              {watchExpressions.map((w) => (
                <div key={w.id} className="flex items-center gap-1 py-0.5 text-xs group">
                  <span className="text-syntax-variable">{w.expression}</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-syntax-string">{w.value}</span>
                  <button onClick={() => removeWatch(w.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="text"
                  value={newWatchExpr}
                  onChange={(e) => setNewWatchExpr(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWatchExpression()}
                  placeholder="Add expression..."
                  className="flex-1 bg-vscode-input border border-vscode-input-border rounded px-1.5 py-0.5 text-[11px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Call Stack */}
        <div>
          <button onClick={() => toggleSection("callStack")} className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider">
            {sectionsCollapsed.callStack ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            Call Stack
          </button>
          {!sectionsCollapsed.callStack && (
            <div className="px-3">
              {callStack.length === 0 ? (
                <p className="text-[10px] text-muted-foreground py-1">Not available.</p>
              ) : (
                callStack.map((frame, i) => (
                  <div key={frame.id} className={`flex items-center gap-1 py-0.5 text-xs cursor-pointer hover:bg-accent/30 rounded px-1 ${i === 0 ? "bg-accent/20" : ""}`}>
                    <span className="text-syntax-function">{frame.name}</span>
                    <span className="text-muted-foreground text-[10px] ml-auto">{frame.file}:{frame.line}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Breakpoints */}
        <div>
          <button onClick={() => toggleSection("breakpoints")} className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider">
            {sectionsCollapsed.breakpoints ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            Breakpoints
            <span className="ml-auto bg-accent text-muted-foreground rounded-full px-1.5 text-[10px] font-normal normal-case">
              {breakpoints.length}
            </span>
          </button>
          {!sectionsCollapsed.breakpoints && (
            <div className="px-3">
              {breakpoints.map((bp) => (
                <div key={bp.id} className="flex items-center gap-1.5 py-0.5 text-xs group">
                  <button onClick={() => toggleBreakpoint(bp.id)}>
                    <Circle size={10} fill={bp.enabled ? "hsl(var(--destructive))" : "transparent"} className={bp.enabled ? "text-destructive" : "text-muted-foreground"} />
                  </button>
                  <span className={bp.enabled ? "text-foreground" : "text-muted-foreground line-through"}>{bp.fileName}</span>
                  <span className="text-muted-foreground">:{bp.line}</span>
                  <button onClick={() => removeBreakpoint(bp.id)} className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Console */}
        <div className="border-t border-border mt-2">
          <button onClick={() => toggleSection("console")} className="flex items-center gap-1 w-full px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-accent/30 uppercase tracking-wider">
            {sectionsCollapsed.console ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            Debug Console
            {consoleEntries.length > 0 && (
              <span className="ml-auto bg-accent text-muted-foreground rounded-full px-1.5 text-[10px] font-normal normal-case">
                {consoleEntries.length}
              </span>
            )}
          </button>
          {!sectionsCollapsed.console && (
            <div className="px-3 max-h-40 overflow-y-auto">
              {consoleEntries.length === 0 ? (
                <p className="text-[10px] text-muted-foreground py-1">No output yet.</p>
              ) : (
                consoleEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-1 py-0.5 text-[11px] font-mono">
                    {getConsoleIcon(entry.type)}
                    <span className="text-muted-foreground text-[9px] shrink-0">{entry.timestamp}</span>
                    <span className={
                      entry.type === "error" ? "text-destructive" :
                      entry.type === "warn" ? "text-syntax-string" :
                      "text-foreground"
                    }>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
