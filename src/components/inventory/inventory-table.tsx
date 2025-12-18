import type { InventoryItem } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditItemDialog } from "./edit-item-dialog";
import DeleteItemButton from "./delete-item-button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type InventoryTableProps = {
  items: InventoryItem[];
  onUpdateItem: (itemId: string, item: Omit<InventoryItem, 'id'>) => void;
  onDeleteItem: (itemId: string) => void;
};

export default function InventoryTable({ items, onUpdateItem, onDeleteItem }: InventoryTableProps) {
  if (items.length === 0) {
    const emptyStateImage = PlaceHolderImages.find(p => p.id === "empty-state-box");
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            {emptyStateImage && (
                <Image
                    src={emptyStateImage.imageUrl}
                    alt={emptyStateImage.description}
                    width={400}
                    height={300}
                    className="max-w-xs rounded-lg object-contain"
                    data-ai-hint={emptyStateImage.imageHint}
                />
            )}
          <h3 className="text-2xl font-bold tracking-tight">Your inventory is empty!</h3>
          <p className="text-muted-foreground">
            Add your first item using the 'Add Item' button to get started.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Total Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="transition-colors">
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                   <TableCell className="hidden sm:table-cell text-right font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditItemDialog
                        item={item}
                        onUpdateItem={onUpdateItem}
                      />
                      <DeleteItemButton
                        itemId={item.id}
                        onDeleteItem={onDeleteItem}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}