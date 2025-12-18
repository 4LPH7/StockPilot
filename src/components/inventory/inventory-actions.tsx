"use client";

import { Search, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/types/inventory";
import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";

type InventoryActionsProps = {
  searchTerm: string;
  onSearch: (term: string) => void;
  inventory: InventoryItem[];
};

export default function InventoryActions({ searchTerm, onSearch, inventory }: InventoryActionsProps) {

  const handleExport = () => {
    if (inventory.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There is no inventory to export.",
      });
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(inventory.map(item => ({
      Name: item.name,
      Category: item.category,
      Price: item.price,
      Quantity: item.quantity,
      "Total Value": item.price * item.quantity,
      Description: item.description,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "StockPilot_Inventory.xlsx");

    toast({
      title: "Export Successful",
      description: "Your inventory has been exported to an Excel file.",
    });
  };

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
      <Button onClick={handleExport} variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );
}
