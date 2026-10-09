import type { InventoryItem } from "@/types/inventory";
import type { Currency } from "@/app/page";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditItemDialog } from "./edit-item-dialog";
import DeleteItemButton from "./delete-item-button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { getItemStockStatus, getStatusBadgeDetails } from "@/lib/stock-status";

type InventoryTableProps = {
  items: InventoryItem[];
  onUpdateItem: (itemId: string, item: Omit<InventoryItem, 'id'>) => void;
  onDeleteItem: (itemId: string) => void;
  currency: Currency;
  conversionRate: number;
};

export default function InventoryTable({ items, onUpdateItem, onDeleteItem, currency, conversionRate }: InventoryTableProps) {
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
            Add your first item using the &apos;Add Item&apos; button to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const convertPrice = (price: number) => {
    if (currency === 'USD') {
      return price / conversionRate;
    }
    return price;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Item</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Total Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const convertedPrice = convertPrice(item.price);
                  return (
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
                      <TableCell className="text-right">{formatCurrency(convertedPrice)}</TableCell>
                      <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const status = getItemStockStatus(item.quantity, item.lowStockThreshold);
                          const details = getStatusBadgeDetails(status);
                          return (
                            <Badge variant={details.variant} className={details.className}>
                              {details.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right font-medium">
                        {formatCurrency(convertedPrice * item.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <EditItemDialog
                                  item={item}
                                  onUpdateItem={onUpdateItem}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Item</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <DeleteItemButton
                                  itemId={item.id}
                                  onDeleteItem={onDeleteItem}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Item</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
