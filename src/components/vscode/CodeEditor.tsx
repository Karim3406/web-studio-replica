import { useMemo } from "react";

interface CodeEditorProps {
  fileName: string;
}

const fileContents: Record<string, { lines: string[]; language: string }> = {
  "App.tsx": {
    language: "tsx",
    lines: [
      'import React from "react";',
      'import { Header } from "./Header";',
      'import { Sidebar } from "./Sidebar";',
      'import { Button } from "./Button";',
      "",
      "interface AppProps {",
      "  title: string;",
      "  theme?: 'light' | 'dark';",
      "}",
      "",
      "const App: React.FC<AppProps> = ({ title, theme = 'dark' }) => {",
      "  const [count, setCount] = React.useState(0);",
      "  const [isOpen, setIsOpen] = React.useState(false);",
      "",
      "  const handleIncrement = () => {",
      "    setCount((prev) => prev + 1);",
      "  };",
      "",
      "  React.useEffect(() => {",
      "    document.title = `${title} - Count: ${count}`;",
      "    return () => {",
      '      document.title = "My App";',
      "    };",
      "  }, [title, count]);",
      "",
      "  return (",
      '    <div className={`app ${theme}`}>',
      "      <Header title={title} />",
      '      <main className="content">',
      "        <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />",
      '        <section className="main-content">',
      "          <h1>{title}</h1>",
      "          <p>Current count: {count}</p>",
      "          <Button onClick={handleIncrement}>",
      "            Increment",
      "          </Button>",
      "        </section>",
      "      </main>",
      "    </div>",
      "  );",
      "};",
      "",
      "export default App;",
    ],
  },
  "main.tsx": {
    language: "tsx",
    lines: [
      'import React from "react";',
      'import ReactDOM from "react-dom/client";',
      'import App from "./components/App";',
      'import "./styles/globals.css";',
      "",
      'const root = ReactDOM.createRoot(',
      '  document.getElementById("root") as HTMLElement',
      ");",
      "",
      "root.render(",
      "  <React.StrictMode>",
      '    <App title="My Application" theme="dark" />',
      "  </React.StrictMode>",
      ");",
    ],
  },
  "index.tsx": {
    language: "tsx",
    lines: [
      'export { default as App } from "./components/App";',
      'export { Header } from "./components/Header";',
      'export { Sidebar } from "./components/Sidebar";',
      'export { Button } from "./components/Button";',
      'export type { AppProps } from "./components/App";',
    ],
  },
  "Header.tsx": {
    language: "tsx",
    lines: [
      'import React from "react";',
      "",
      "interface HeaderProps {",
      "  title: string;",
      "  onMenuClick?: () => void;",
      "}",
      "",
      "export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {",
      "  return (",
      '    <header className="header">',
      '      <div className="header-left">',
      '        <button onClick={onMenuClick} className="menu-btn">',
      "          ☰",
      "        </button>",
      "        <h1>{title}</h1>",
      "      </div>",
      '      <nav className="header-nav">',
      "        <a href=\"/\">Home</a>",
      '        <a href="/about">About</a>',
      '        <a href="/contact">Contact</a>',
      "      </nav>",
      "    </header>",
      "  );",
      "};",
    ],
  },
  "Button.tsx": {
    language: "tsx",
    lines: [
      'import React from "react";',
      "",
      "interface ButtonProps {",
      "  variant?: 'primary' | 'secondary' | 'danger';",
      "  size?: 'sm' | 'md' | 'lg';",
      "  disabled?: boolean;",
      "  onClick?: () => void;",
      "  children: React.ReactNode;",
      "}",
      "",
      "export const Button: React.FC<ButtonProps> = ({",
      "  variant = 'primary',",
      "  size = 'md',",
      "  disabled = false,",
      "  onClick,",
      "  children,",
      "}) => {",
      "  const baseClass = 'btn';",
      "  const variantClass = `btn-${variant}`;",
      "  const sizeClass = `btn-${size}`;",
      "",
      "  return (",
      "    <button",
      "      className={`${baseClass} ${variantClass} ${sizeClass}`}",
      "      disabled={disabled}",
      "      onClick={onClick}",
      "    >",
      "      {children}",
      "    </button>",
      "  );",
      "};",
    ],
  },
  "types.ts": {
    language: "ts",
    lines: [
      "export interface User {",
      "  id: string;",
      "  name: string;",
      "  email: string;",
      "  role: 'admin' | 'user' | 'guest';",
      "  createdAt: Date;",
      "  updatedAt: Date;",
      "}",
      "",
      "export interface ApiResponse<T> {",
      "  data: T;",
      "  status: number;",
      "  message: string;",
      "  timestamp: string;",
      "}",
      "",
      "export type Theme = 'light' | 'dark' | 'system';",
      "",
      "export interface AppConfig {",
      "  theme: Theme;",
      "  language: string;",
      "  notifications: boolean;",
      "  autoSave: boolean;",
      "  fontSize: number;",
      "}",
    ],
  },
  "Sidebar.tsx": {
    language: "tsx",
    lines: [
      'import React from "react";',
      "",
      "interface SidebarProps {",
      "  isOpen: boolean;",
      "  onToggle: () => void;",
      "}",
      "",
      "const menuItems = [",
      '  { icon: "📊", label: "Dashboard", path: "/" },',
      '  { icon: "📁", label: "Projects", path: "/projects" },',
      '  { icon: "⚙️", label: "Settings", path: "/settings" },',
      "];",
      "",
      "export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {",
      "  if (!isOpen) return null;",
      "",
      "  return (",
      '    <aside className="sidebar">',
      "      {menuItems.map((item) => (",
      "        <a key={item.path} href={item.path}>",
      "          <span>{item.icon}</span>",
      "          <span>{item.label}</span>",
      "        </a>",
      "      ))}",
      "    </aside>",
      "  );",
      "};",
    ],
  },
  "useTheme.ts": {
    language: "ts",
    lines: [
      'import { useState, useEffect } from "react";',
      'import { Theme } from "../types";',
      "",
      "export const useTheme = (initial: Theme = 'system') => {",
      "  const [theme, setTheme] = useState<Theme>(initial);",
      "",
      "  useEffect(() => {",
      "    const root = document.documentElement;",
      "    if (theme === 'system') {",
      "      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;",
      "      root.classList.toggle('dark', isDark);",
      "    } else {",
      "      root.classList.toggle('dark', theme === 'dark');",
      "    }",
      "  }, [theme]);",
      "",
      "  return { theme, setTheme };",
      "};",
    ],
  },
  "useAuth.ts": {
    language: "ts",
    lines: [
      'import { useState, useCallback } from "react";',
      'import { User } from "../types";',
      "",
      "export const useAuth = () => {",
      "  const [user, setUser] = useState<User | null>(null);",
      "  const [loading, setLoading] = useState(false);",
      "",
      "  const login = useCallback(async (email: string, password: string) => {",
      "    setLoading(true);",
      "    try {",
      "      // API call here",
      "      const response = await fetch('/api/auth/login', {",
      "        method: 'POST',",
      "        body: JSON.stringify({ email, password }),",
      "      });",
      "      const data = await response.json();",
      "      setUser(data.user);",
      "    } finally {",
      "      setLoading(false);",
      "    }",
      "  }, []);",
      "",
      "  const logout = useCallback(() => {",
      "    setUser(null);",
      "  }, []);",
      "",
      "  return { user, loading, login, logout };",
      "};",
    ],
  },
  "package.json": {
    language: "json",
    lines: [
      "{",
      '  "name": "my-project",',
      '  "version": "1.0.0",',
      '  "private": true,',
      '  "scripts": {',
      '    "dev": "vite",',
      '    "build": "tsc && vite build",',
      '    "preview": "vite preview",',
      '    "lint": "eslint . --ext ts,tsx"',
      "  },",
      '  "dependencies": {',
      '    "react": "^18.3.1",',
      '    "react-dom": "^18.3.1"',
      "  },",
      '  "devDependencies": {',
      '    "typescript": "^5.4.0",',
      '    "vite": "^5.2.0",',
      '    "@types/react": "^18.3.0"',
      "  }",
      "}",
    ],
  },
  "tsconfig.json": {
    language: "json",
    lines: [
      "{",
      '  "compilerOptions": {',
      '    "target": "ES2020",',
      '    "module": "ESNext",',
      '    "lib": ["ES2020", "DOM"],',
      '    "jsx": "react-jsx",',
      '    "strict": true,',
      '    "esModuleInterop": true,',
      '    "skipLibCheck": true,',
      '    "outDir": "./dist",',
      '    "baseUrl": ".",',
      '    "paths": {',
      '      "@/*": ["./src/*"]',
      "    }",
      "  },",
      '  "include": ["src"],',
      '  "exclude": ["node_modules"]',
      "}",
    ],
  },
  "globals.css": {
    language: "css",
    lines: [
      ":root {",
      "  --primary: #007acc;",
      "  --bg-dark: #1e1e1e;",
      "  --text: #d4d4d4;",
      "  --border: #333;",
      "}",
      "",
      "* {",
      "  margin: 0;",
      "  padding: 0;",
      "  box-sizing: border-box;",
      "}",
      "",
      "body {",
      "  font-family: 'Segoe UI', sans-serif;",
      "  background: var(--bg-dark);",
      "  color: var(--text);",
      "}",
      "",
      ".app {",
      "  display: flex;",
      "  flex-direction: column;",
      "  min-height: 100vh;",
      "}",
    ],
  },
  "README.md": {
    language: "md",
    lines: [
      "# My Project",
      "",
      "A modern React application built with TypeScript and Vite.",
      "",
      "## Getting Started",
      "",
      "```bash",
      "npm install",
      "npm run dev",
      "```",
      "",
      "## Features",
      "",
      "- React 18 with TypeScript",
      "- Vite for fast development",
      "- Component-based architecture",
      "- Dark theme support",
    ],
  },
};

const tokenize = (line: string, language: string) => {
  const tokens: { text: string; className: string }[] = [];

  if (language === "json") {
    let remaining = line;
    const jsonRegex = /("(?:[^"\\]|\\.)*")\s*:/g;
    const valueRegex = /:\s*("(?:[^"\\]|\\.)*")/g;
    const numRegex = /:\s*(\d+)/g;

    let lastIndex = 0;
    const parts: { start: number; end: number; text: string; cls: string }[] = [];

    let match;
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

  // Simple tokenizer for TS/TSX
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

const CodeEditor = ({ fileName }: CodeEditorProps) => {
  const fileData = fileContents[fileName];

  const content = useMemo(() => {
    if (!fileData) return null;
    return fileData.lines.map((line, i) => ({
      number: i + 1,
      tokens: tokenize(line, fileData.language),
    }));
  }, [fileData]);

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
    <div className="flex-1 overflow-auto scrollbar-thin bg-vscode-editor font-mono text-[13px] leading-[20px]">
      <div className="min-w-max">
        {content?.map(({ number, tokens }) => (
          <div key={number} className="flex hover:bg-vscode-editor-line group">
            <div className="w-16 text-right pr-4 pl-4 select-none text-vscode-line-number group-hover:text-vscode-line-number-active shrink-0">
              {number}
            </div>
            <div className="pr-8">
              {tokens.map((token, j) => (
                <span key={j} className={token.className}>
                  {token.text}
                </span>
              ))}
              {tokens.length === 0 && <span>&nbsp;</span>}
            </div>
          </div>
        ))}
        <div className="h-32" />
      </div>
    </div>
  );
};

export default CodeEditor;
