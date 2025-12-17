import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type InventoryActionsProps = {
  searchTerm: string;
  onSearch: (term: string) => void;
};

export default function InventoryActions({ searchTerm, onSearch }: InventoryActionsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by item name..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
