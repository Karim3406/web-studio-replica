import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Cascadia Code'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'Segoe UI'", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        vscode: {
          titlebar: "hsl(var(--vscode-titlebar))",
          activitybar: "hsl(var(--vscode-activitybar))",
          "activitybar-foreground": "hsl(var(--vscode-activitybar-foreground))",
          "activitybar-inactive": "hsl(var(--vscode-activitybar-inactive))",
          sidebar: "hsl(var(--vscode-sidebar))",
          "sidebar-foreground": "hsl(var(--vscode-sidebar-foreground))",
          editor: "hsl(var(--vscode-editor))",
          "editor-line": "hsl(var(--vscode-editor-line))",
          terminal: "hsl(var(--vscode-terminal))",
          statusbar: "hsl(var(--vscode-statusbar))",
          "statusbar-foreground": "hsl(var(--vscode-statusbar-foreground))",
          "tab-active": "hsl(var(--vscode-tab-active))",
          "tab-inactive": "hsl(var(--vscode-tab-inactive))",
          "tab-border": "hsl(var(--vscode-tab-border))",
          selection: "hsl(var(--vscode-selection))",
          "line-number": "hsl(var(--vscode-line-number))",
          "line-number-active": "hsl(var(--vscode-line-number-active))",
          badge: "hsl(var(--vscode-badge))",
          "badge-foreground": "hsl(var(--vscode-badge-foreground))",
          "find-match": "hsl(var(--vscode-find-match))",
          input: "hsl(var(--vscode-input))",
          "input-border": "hsl(var(--vscode-input-border))",
        },
        syntax: {
          keyword: "hsl(var(--syntax-keyword))",
          string: "hsl(var(--syntax-string))",
          number: "hsl(var(--syntax-number))",
          comment: "hsl(var(--syntax-comment))",
          function: "hsl(var(--syntax-function))",
          variable: "hsl(var(--syntax-variable))",
          type: "hsl(var(--syntax-type))",
          operator: "hsl(var(--syntax-operator))",
          tag: "hsl(var(--syntax-tag))",
          attribute: "hsl(var(--syntax-attribute))",
          punctuation: "hsl(var(--syntax-punctuation))",
          constant: "hsl(var(--syntax-constant))",
          decorator: "hsl(var(--syntax-decorator))",
          regex: "hsl(var(--syntax-regex))",
          "jsx-tag": "hsl(var(--syntax-jsx-tag))",
          "jsx-component": "hsl(var(--syntax-jsx-component))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "cursor-blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cursor-blink": "cursor-blink 1s step-end infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
