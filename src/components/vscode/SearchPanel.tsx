import { useState, useMemo, useCallback } from "react";
import { Search, Replace, ChevronRight, ChevronDown, X, CaseSensitive, WholeWord, Regex } from "lucide-react";
import { FileData } from "@/data/defaultFiles";

interface SearchResult {
  fileName: string;
  line: number;
  col: number;
  lineContent: string;
  matchLength: number;
}

interface SearchPanelProps {
  files: Record<string, FileData>;
  onFileSelect: (fileName: string) => void;
  onReplaceInFile: (fileName: string, search: string, replace: string, all?: boolean) => void;
}

const SearchPanel = ({ files, onFileSelect, onReplaceInFile }: SearchPanelProps) => {
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set());
  const [showReplace, setShowReplace] = useState(false);

  const results = useMemo(() => {
    if (!query) return [];
    const matches: SearchResult[] = [];
    let regex: RegExp;
    try {
      const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const wordPattern = wholeWord ? `\\b${pattern}\\b` : pattern;
      regex = new RegExp(wordPattern, caseSensitive ? "g" : "gi");
    } catch {
      return [];
    }

    for (const [fileName, fileData] of Object.entries(files)) {
      const lines = fileData.content.split("\n");
      lines.forEach((line, i) => {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(line)) !== null) {
          matches.push({
            fileName,
            line: i + 1,
            col: match.index + 1,
            lineContent: line,
            matchLength: match[0].length,
          });
        }
      });
    }
    return matches;
  }, [query, files, caseSensitive, wholeWord, useRegex]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      (groups[r.fileName] ??= []).push(r);
    }
    return groups;
  }, [results]);

  const fileCount = Object.keys(groupedResults).length;

  const toggleCollapse = useCallback((fileName: string) => {
    setCollapsedFiles((prev) => {
      const next = new Set(prev);
      next.has(fileName) ? next.delete(fileName) : next.add(fileName);
      return next;
    });
  }, []);

  const highlightMatch = (lineContent: string, col: number, matchLength: number) => {
    const before = lineContent.substring(0, col - 1);
    const match = lineContent.substring(col - 1, col - 1 + matchLength);
    const after = lineContent.substring(col - 1 + matchLength);
    return (
      <span className="whitespace-pre">
        <span className="text-muted-foreground">{before.trimStart()}</span>
        <span className="bg-vscode-search-match text-vscode-search-match-foreground rounded-sm">{match}</span>
        <span className="text-muted-foreground">{after}</span>
      </span>
    );
  };

  return (
    <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
        Search
      </div>
      <div className="px-3 pb-2">
        <div className="flex gap-1 mb-2">
          <div className="flex-1">
            <div className="flex items-center bg-vscode-input border border-vscode-input-border rounded px-2 py-1">
              <button onClick={() => setShowReplace(!showReplace)} className="mr-1 text-muted-foreground hover:text-foreground">
                {showReplace ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs ml-1.5 w-full text-foreground placeholder:text-muted-foreground"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground ml-1">
                  <X size={12} />
                </button>
              )}
            </div>
            {showReplace && (
              <div className="flex items-center bg-vscode-input border border-vscode-input-border rounded px-2 py-1 mt-1">
                <Replace size={14} className="text-muted-foreground shrink-0 ml-4" />
                <input
                  type="text"
                  placeholder="Replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs ml-1.5 w-full text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 mb-2">
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            className={`p-1 rounded text-xs ${caseSensitive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Match Case"
          >
            <CaseSensitive size={14} />
          </button>
          <button
            onClick={() => setWholeWord(!wholeWord)}
            className={`p-1 rounded text-xs ${wholeWord ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Match Whole Word"
          >
            <WholeWord size={14} />
          </button>
          <button
            onClick={() => setUseRegex(!useRegex)}
            className={`p-1 rounded text-xs ${useRegex ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Use Regular Expression"
          >
            <Regex size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto text-xs">
        {!query && (
          <p className="px-3 text-muted-foreground">Search to find results across your files.</p>
        )}
        {query && results.length === 0 && (
          <p className="px-3 text-muted-foreground">No results found.</p>
        )}
        {query && results.length > 0 && (
          <>
            <div className="px-3 pb-1 text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} in {fileCount} file{fileCount !== 1 ? "s" : ""}
            </div>
            {Object.entries(groupedResults).map(([fileName, fileResults]) => (
              <div key={fileName}>
                <button
                  className="flex items-center gap-1 w-full px-3 py-0.5 hover:bg-accent/50 text-left"
                  onClick={() => toggleCollapse(fileName)}
                >
                  {collapsedFiles.has(fileName) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  <span className="text-foreground truncate">{fileName}</span>
                  <span className="ml-auto text-muted-foreground text-[10px] bg-accent/50 rounded-full px-1.5">
                    {fileResults.length}
                  </span>
                </button>
                {!collapsedFiles.has(fileName) &&
                  fileResults.map((r, i) => (
                    <button
                      key={i}
                      className="flex items-center w-full pl-8 pr-3 py-0.5 hover:bg-accent/50 text-left overflow-hidden"
                      onClick={() => onFileSelect(r.fileName)}
                    >
                      <span className="truncate text-[11px]">
                        {highlightMatch(r.lineContent, r.col, r.matchLength)}
                      </span>
                    </button>
                  ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
