export interface FileData {
  content: string;
  language: string;
}

export const defaultFileContents: Record<string, FileData> = {
  "App.tsx": {
    language: "tsx",
    content: `import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Button } from "./Button";

interface AppProps {
  title: string;
  theme?: 'light' | 'dark';
}

const App: React.FC<AppProps> = ({ title, theme = 'dark' }) => {
  const [count, setCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleIncrement = () => {
    setCount((prev) => prev + 1);
  };

  React.useEffect(() => {
    document.title = \`\${title} - Count: \${count}\`;
    return () => {
      document.title = "My App";
    };
  }, [title, count]);

  return (
    <div className={\`app \${theme}\`}>
      <Header title={title} />
      <main className="content">
        <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
        <section className="main-content">
          <h1>{title}</h1>
          <p>Current count: {count}</p>
          <Button onClick={handleIncrement}>
            Increment
          </Button>
        </section>
      </main>
    </div>
  );
};

export default App;`,
  },
  "main.tsx": {
    language: "tsx",
    content: `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./styles/globals.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App title="My Application" theme="dark" />
  </React.StrictMode>
);`,
  },
  "index.tsx": {
    language: "tsx",
    content: `export { default as App } from "./components/App";
export { Header } from "./components/Header";
export { Sidebar } from "./components/Sidebar";
export { Button } from "./components/Button";
export type { AppProps } from "./components/App";`,
  },
  "Header.tsx": {
    language: "tsx",
    content: `import React from "react";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button onClick={onMenuClick} className="menu-btn">
          ☰
        </button>
        <h1>{title}</h1>
      </div>
      <nav className="header-nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
  );
};`,
  },
  "Button.tsx": {
    language: "tsx",
    content: `import React from "react";

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  const baseClass = 'btn';
  const variantClass = \`btn-\${variant}\`;
  const sizeClass = \`btn-\${size}\`;

  return (
    <button
      className={\`\${baseClass} \${variantClass} \${sizeClass}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`,
  },
  "types.ts": {
    language: "ts",
    content: `export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppConfig {
  theme: Theme;
  language: string;
  notifications: boolean;
  autoSave: boolean;
  fontSize: number;
}`,
  },
  "Sidebar.tsx": {
    language: "tsx",
    content: `import React from "react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: "📊", label: "Dashboard", path: "/" },
  { icon: "📁", label: "Projects", path: "/projects" },
  { icon: "⚙️", label: "Settings", path: "/settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      {menuItems.map((item) => (
        <a key={item.path} href={item.path}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </aside>
  );
};`,
  },
  "useTheme.ts": {
    language: "ts",
    content: `import { useState, useEffect } from "react";
import { Theme } from "../types";

export const useTheme = (initial: Theme = 'system') => {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return { theme, setTheme };
};`,
  },
  "useAuth.ts": {
    language: "ts",
    content: `import { useState, useCallback } from "react";
import { User } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, loading, login, logout };
};`,
  },
  "package.json": {
    language: "json",
    content: `{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@types/react": "^18.3.0"
  }
}`,
  },
  "tsconfig.json": {
    language: "json",
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}`,
  },
  "globals.css": {
    language: "css",
    content: `:root {
  --primary: #007acc;
  --bg-dark: #1e1e1e;
  --text: #d4d4d4;
  --border: #333;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', sans-serif;
  background: var(--bg-dark);
  color: var(--text);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}`,
  },
  "README.md": {
    language: "md",
    content: `# My Project

A modern React application built with TypeScript and Vite.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- React 18 with TypeScript
- Vite for fast development
- Component-based architecture
- Dark theme support`,
  },
};
