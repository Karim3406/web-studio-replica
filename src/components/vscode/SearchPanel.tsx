import { Search, Replace, ChevronRight, X, MoreHorizontal } from "lucide-react";

const SearchPanel = () => {
  return (
    <div className="w-60 bg-vscode-sidebar border-r border-border flex flex-col select-none overflow-hidden">
      <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
        Search
      </div>
      <div className="px-3 pb-3">
        <div className="flex items-center bg-input border border-border rounded px-2 py-1 mb-2">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center bg-input border border-border rounded px-2 py-1">
          <Replace size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Replace"
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="px-3 text-xs text-muted-foreground">
        <p>Search to find results across your files.</p>
      </div>
    </div>
  );
};

export default SearchPanel;
