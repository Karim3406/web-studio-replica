import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FileData } from "@/data/defaultFiles";

interface ErrorDiagnostic {
  line: number;
  startCol: number;
  endCol: number;
  message: string;
  severity: "error" | "warning";
}

const detectErrors = (content: string, language: string): ErrorDiagnostic[] => {
  const errors: ErrorDiagnostic[] = [];
  const lines = content.split("\n");

  if (!["tsx", "ts", "jsx", "js"].includes(language)) return errors;

  lines.forEach((line, i) => {
    // Missing semicolons on statements (not blocks, not comments, not empty, not JSX)
    const trimmed = line.trim();
    if (
      trimmed.length > 0 &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("/*") &&
      !trimmed.startsWith("*") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("(") &&
      !trimmed.endsWith(")") &&
      !trimmed.endsWith(">") &&
      !trimmed.endsWith(":") &&
      !trimmed.endsWith("=>") &&
      !trimmed.startsWith("import") &&
      !trimmed.startsWith("export") &&
      !trimmed.startsWith("<") &&
      !trimmed.startsWith("return") &&
      !trimmed.startsWith("if") &&
      !trimmed.startsWith("else") &&
      !trimmed.startsWith("case") &&
      !trimmed.startsWith("default") &&
      /^(const|let|var)\s+\w+\s*=\s*.+[^;,{(>\s]$/.test(trimmed)
    ) {
      errors.push({
        line: i + 1,
        startCol: line.length - trimmed.length,
        endCol: line.length,
        message: "Missing semicolon",
        severity: "warning",
      });
    }

    // Unclosed string literals
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    const backticks = (trimmed.match(/`/g) || []).length;
    if (singleQuotes % 2 !== 0 && !trimmed.includes("'s") && !trimmed.startsWith("//")) {
      const idx = line.indexOf("'");
      errors.push({
        line: i + 1,
        startCol: idx,
        endCol: line.length,
        message: "Unterminated string literal",
        severity: "error",
      });
    }

    // console.log warnings
    if (trimmed.includes("console.log")) {
      const idx = line.indexOf("console.log");
      errors.push({
        line: i + 1,
        startCol: idx,
        endCol: idx + 11,
        message: "Unexpected console statement",
        severity: "warning",
      });
    }

    // Unmatched brackets on single line
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    if (
      openParens > 0 &&
      closeParens > 0 &&
      openParens !== closeParens &&
      !trimmed.startsWith("//")
    ) {
      errors.push({
        line: i + 1,
        startCol: 0,
        endCol: line.length,
        message: "Mismatched parentheses",
        severity: "error",
      });
    }

    // any type usage
    const anyMatch = trimmed.match(/:\s*any\b/);
    if (anyMatch && language === "ts" || language === "tsx") {
      const idx = line.indexOf(anyMatch?.[0] || "");
      if (anyMatch && idx >= 0) {
        errors.push({
          line: i + 1,
          startCol: idx,
          endCol: idx + (anyMatch[0]?.length || 3),
          message: "Unexpected any. Specify a different type",
          severity: "warning",
        });
      }
    }
  });

  return errors;
};

interface CodeEditorProps {
  fileName: string;
  fileData: FileData | null;
  onContentChange: (fileName: string, content: string) => void;
  onCursorChange: (line: number, col: number) => void;
}

const tokenize = (line: string, language: string) => {
  const tokens: { text: string; className: string }[] = [];

  if (language === "json") {
    const parts: { start: number; end: number; text: string; cls: string }[] = [];
    let match;
    const jsonRegex = /("(?:[^"\\]|\\.)*")\s*:/g;
    const valueRegex = /:\s*("(?:[^"\\]|\\.)*")/g;
    const numRegex = /:\s*(\d+)/g;
    let lastIndex = 0;

    while ((match = jsonRegex.exec(line)) !== null) {
      parts.push({ start: match.index, end: match.index + match[1].length, text: match[1], cls: "text-syntax-variable" });
    }
    while ((match = valueRegex.exec(line)) !== null) {
      const valStart = match.index + match[0].indexOf(match[1]);
      parts.push({ start: valStart, end: valStart + match[1].length, text: match[1], cls: "text-syntax-string" });
    }
    while ((match = numRegex.exec(line)) !== null) {
      const valStart = match.index + match[0].indexOf(match[1]);
      parts.push({ start: valStart, end: valStart + match[1].length, text: match[1], cls: "text-syntax-number" });
    }

    if (parts.length === 0) {
      tokens.push({ text: line, className: "text-foreground" });
      return tokens;
    }

    parts.sort((a, b) => a.start - b.start);
    for (const part of parts) {
      if (part.start > lastIndex) {
        tokens.push({ text: line.slice(lastIndex, part.start), className: "text-foreground" });
      }
      tokens.push({ text: part.text, className: part.cls });
      lastIndex = part.end;
    }
    if (lastIndex < line.length) {
      tokens.push({ text: line.slice(lastIndex), className: "text-foreground" });
    }
    return tokens;
  }

  const patterns: [RegExp, string][] = [
    [/\/\/.*$/, "text-syntax-comment"],
    [/\/\*.*?\*\//, "text-syntax-comment"],
    [/\b(import|from|export|default|const|let|var|function|return|if|else|switch|case|break|continue|for|while|do|try|catch|finally|throw|new|typeof|instanceof|in|of|as|type|interface|enum|class|extends|implements|async|await|yield)\b/, "text-syntax-keyword"],
    [/\b(React|useState|useEffect|useCallback|useMemo|useRef|useContext)\b/, "text-syntax-type"],
    [/\b(true|false|null|undefined|void|never)\b/, "text-syntax-constant"],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/, "text-syntax-string"],
    [/\b\d+\.?\d*\b/, "text-syntax-number"],
    [/<\/?[A-Z]\w*/, "text-syntax-jsx-component"],
    [/<\/?[a-z]\w*/, "text-syntax-tag"],
    [/\b\w+(?=\()/, "text-syntax-function"],
    [/[{}()\[\];,.:?!<>=+\-*/&|^~%@#]/, "text-syntax-punctuation"],
  ];

  let remaining = line;
  while (remaining.length > 0) {
    let bestMatch: { index: number; length: number; className: string } | null = null;

    for (const [regex, className] of patterns) {
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (!bestMatch || match.index < bestMatch.index) {
          bestMatch = { index: match.index, length: match[0].length, className };
        }
      }
    }

    if (bestMatch && bestMatch.index === 0) {
      tokens.push({ text: remaining.slice(0, bestMatch.length), className: bestMatch.className });
      remaining = remaining.slice(bestMatch.length);
    } else if (bestMatch) {
      tokens.push({ text: remaining.slice(0, bestMatch.index), className: "text-foreground" });
      tokens.push({ text: remaining.slice(bestMatch.index, bestMatch.index + bestMatch.length), className: bestMatch.className });
      remaining = remaining.slice(bestMatch.index + bestMatch.length);
    } else {
      tokens.push({ text: remaining, className: "text-foreground" });
      break;
    }
  }

  return tokens;
};

const CodeEditor = ({ fileName, fileData, onContentChange, onCursorChange }: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const content = fileData?.content ?? "";
  const lines = content.split("\n");

  const diagnostics = useMemo(() => {
    if (!fileData) return [];
    return detectErrors(content, fileData.language);
  }, [content, fileData?.language]);

  const diagnosticsByLine = useMemo(() => {
    const map = new Map<number, ErrorDiagnostic[]>();
    for (const d of diagnostics) {
      const arr = map.get(d.line) || [];
      arr.push(d);
      map.set(d.line, arr);
    }
    return map;
  }, [diagnostics]);

  const highlightedLines = useMemo(() => {
    if (!fileData) return [];
    return lines.map((line, i) => ({
      number: i + 1,
      tokens: tokenize(line, fileData.language),
    }));
  }, [content, fileData?.language]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onContentChange(fileName, e.target.value);
    },
    [fileName, onContentChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const value = ta.value;
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onContentChange(fileName, newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [fileName, onContentChange]
  );

  const updateCursor = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);
    const lineNum = textBefore.split("\n").length;
    const colNum = pos - textBefore.lastIndexOf("\n");
    onCursorChange(lineNum, colNum);
  }, [onCursorChange]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", handleScroll);
    return () => ta.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (!fileData) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden bg-vscode-editor font-mono text-[13px] leading-[20px] relative">
      {/* Syntax highlighted underlay */}
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="min-w-max">
          {highlightedLines.map(({ number, tokens }) => {
            const lineDiags = diagnosticsByLine.get(number) || [];
            return (
              <div key={number} className="flex group relative" style={{ height: 20 }}>
                <div className="w-16 text-right pr-4 pl-4 select-none text-vscode-line-number shrink-0">
                  {number}
                </div>
                <div className="pr-8 whitespace-pre relative">
                  {tokens.map((token, j) => (
                    <span key={j} className={token.className}>
                      {token.text}
                    </span>
                  ))}
                  {tokens.length === 0 && <span> </span>}
                  {/* Error squiggles */}
                  {lineDiags.map((diag, di) => {
                    const lineText = lines[number - 1] || "";
                    const before = lineText.substring(0, diag.startCol);
                    return (
                      <span
                        key={di}
                        className={`absolute ${diag.severity === "error" ? "error-squiggle" : "warning-squiggle"}`}
                        style={{
                          left: `${before.length}ch`,
                          width: `${Math.max(diag.endCol - diag.startCol, 1)}ch`,
                          bottom: 0,
                          height: "3px",
                        }}
                        title={diag.message}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="h-32" />
        </div>
      </div>

      {/* Editable textarea overlay */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={updateCursor}
        onKeyUp={updateCursor}
        spellCheck={false}
        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-foreground resize-none outline-none overflow-auto font-mono text-[13px] leading-[20px] whitespace-pre"
        style={{ paddingLeft: "4rem", paddingTop: 0, paddingRight: "2rem", tabSize: 2 }}
      />
    </div>
  );
};

export default CodeEditor;
