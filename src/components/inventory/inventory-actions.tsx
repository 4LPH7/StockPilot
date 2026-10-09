"use client";

import { Search, FileDown, History, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryItem } from "@/types/inventory";
import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";
import { AddItemDialog } from "./add-item-dialog";

type InventoryActionsProps = {
  searchTerm: string;
  onSearch: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  categories: string[];
  onAddItem: (item: Omit<InventoryItem, "id">) => void;
  onOpenHistory: () => void;
  onOpenImport: () => void;
  inventory: InventoryItem[];
};

export default function InventoryActions({ 
  searchTerm, 
  onSearch, 
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  onAddItem,
  onOpenHistory,
  onOpenImport,
  inventory 
}: InventoryActionsProps) {
  const handleExport = () => {
    if (inventory.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There is no inventory to export.",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      inventory.map((item) => ({
        Name: item.name,
        Category: item.category,
        Price: item.price,
        Quantity: item.quantity,
        Threshold: item.lowStockThreshold ?? 10,
        "Total Value": item.price * item.quantity,
        Description: item.description,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "StockPilot_Inventory.xlsx");

    toast({
      title: "Export Successful",
      description: "Your inventory has been exported to an Excel file.",
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search catalog items"
            placeholder="Search items by name, category, description..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by stock status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onOpenHistory}
          variant="outline"
          aria-label="View stock movement audit history"
          title="View stock movement audit history"
        >
          <History className="mr-2 h-4 w-4" />
          Audit Log
        </Button>
        <Button
          onClick={onOpenImport}
          variant="outline"
          aria-label="Bulk import catalog from CSV or Excel"
          title="Bulk import catalog from CSV or Excel"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button
          onClick={handleExport}
          variant="outline"
          aria-label="Export inventory to Excel"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
        <AddItemDialog onAddItem={onAddItem} />
      </div>
    </div>
  );
}
