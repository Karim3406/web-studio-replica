import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  fileName: string;
}

const filePaths: Record<string, string[]> = {
  "App.tsx": ["src", "components", "App.tsx"],
  "Header.tsx": ["src", "components", "Header.tsx"],
  "Sidebar.tsx": ["src", "components", "Sidebar.tsx"],
  "Button.tsx": ["src", "components", "Button.tsx"],
  "main.tsx": ["src", "main.tsx"],
  "index.tsx": ["src", "index.tsx"],
  "types.ts": ["src", "types.ts"],
  "useTheme.ts": ["src", "hooks", "useTheme.ts"],
  "useAuth.ts": ["src", "hooks", "useAuth.ts"],
  "globals.css": ["src", "styles", "globals.css"],
  "package.json": ["package.json"],
  "tsconfig.json": ["tsconfig.json"],
  "README.md": ["README.md"],
};

const Breadcrumbs = ({ fileName }: BreadcrumbsProps) => {
  const parts = filePaths[fileName] || [fileName];

  return (
    <div className="flex items-center gap-1 px-4 py-1 text-[13px] text-muted-foreground bg-vscode-editor border-b border-border">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          <span className="hover:text-foreground cursor-pointer">{part}</span>
        </span>
      ))}
    </div>
  );
};

export default Breadcrumbs;
