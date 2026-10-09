"use client";

import { useState, useMemo } from "react";
import type { StockMovement, StockMovementType } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  Trash2, 
  Clock 
} from "lucide-react";

type MovementHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movements: StockMovement[];
  loading?: boolean;
};

export function MovementHistoryDialog({
  open,
  onOpenChange,
  movements,
  loading = false,
}: MovementHistoryDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredMovements = useMemo(() => {
    return movements.filter((movement) => {
      // 1. Text filter
      const matchesSearch = movement.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Type filter
      if (typeFilter !== "all" && movement.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [movements, searchTerm, typeFilter]);

  const formatTimestamp = (ts: number) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(ts));
    } catch {
      return new Date(ts).toLocaleString();
    }
  };

  const getMovementBadge = (type: StockMovementType, delta: number) => {
    switch (type) {
      case "creation":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 gap-1 font-medium"
          >
            <PlusCircle className="h-3 w-3" />
            Created (+{delta})
          </Badge>
        );
      case "restock":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 font-medium"
          >
            <ArrowUpRight className="h-3 w-3" />
            Restock (+{delta})
          </Badge>
        );
      case "reduction":
        return (
          <Badge
            variant="destructive"
            className="gap-1 font-medium"
          >
            <ArrowDownRight className="h-3 w-3" />
            Reduction ({delta})
          </Badge>
        );
      case "deletion":
        return (
          <Badge
            variant="outline"
            className="border-destructive/40 bg-destructive/10 text-destructive gap-1 font-medium"
          >
            <Trash2 className="h-3 w-3" />
            Deleted ({delta})
          </Badge>
        );
      case "adjustment":
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-medium">
            <Clock className="h-3 w-3" />
            Adjustment ({delta > 0 ? `+${delta}` : delta})
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Stock Movement Audit Log</DialogTitle>
              <DialogDescription>
                Immutable chronological history of all restocks, adjustments, and deletions.
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by item name..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-9">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="restock">Restocks</SelectItem>
                <SelectItem value="reduction">Reductions</SelectItem>
                <SelectItem value="creation">Creations</SelectItem>
                <SelectItem value="deletion">Deletions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[460px] p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Clock className="h-8 w-8 animate-spin mb-2 opacity-60" />
              <p className="text-sm">Loading audit records...</p>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
              <History className="h-10 w-10 mb-2 opacity-30" />
              <p className="font-semibold text-foreground text-sm">No stock movements found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {movements.length === 0
                  ? "Adding, editing, or deleting items in your catalog will automatically generate immutable audit logs."
                  : "No events matched your current search or type filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3.5 shadow-sm transition-colors hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm text-foreground">
                      {movement.itemName}
                    </div>
                    {getMovementBadge(movement.type, movement.delta)}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 pt-1 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {movement.previousQuantity} → {movement.newQuantity} units
                      </span>
                      {movement.note && (
                        <span className="italic text-muted-foreground/80">
                          • {movement.note}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono">
                      {formatTimestamp(movement.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
