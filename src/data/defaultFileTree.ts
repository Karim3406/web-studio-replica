export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  language?: string;
}

export const defaultFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "components",
        type: "folder",
        children: [
          { name: "App.tsx", type: "file", language: "tsx" },
          { name: "Header.tsx", type: "file", language: "tsx" },
          { name: "Sidebar.tsx", type: "file", language: "tsx" },
          { name: "Button.tsx", type: "file", language: "tsx" },
        ],
      },
      {
        name: "hooks",
        type: "folder",
        children: [
          { name: "useTheme.ts", type: "file", language: "ts" },
          { name: "useAuth.ts", type: "file", language: "ts" },
        ],
      },
      {
        name: "styles",
        type: "folder",
        children: [
          { name: "globals.css", type: "file", language: "css" },
          { name: "components.css", type: "file", language: "css" },
        ],
      },
      { name: "index.tsx", type: "file", language: "tsx" },
      { name: "main.tsx", type: "file", language: "tsx" },
      { name: "types.ts", type: "file", language: "ts" },
    ],
  },
  {
    name: "public",
    type: "folder",
    children: [
      { name: "favicon.ico", type: "file", language: "ico" },
      { name: "logo.svg", type: "file", language: "svg" },
    ],
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
  { name: "README.md", type: "file", language: "md" },
  { name: ".gitignore", type: "file", language: "text" },
];
