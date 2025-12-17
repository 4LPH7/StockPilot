"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type UpdateQuantityButtonsProps = {
  itemId: string;
  onUpdateQuantity: (itemId: string, amount: number) => void;
};

export default function UpdateQuantityButtons({ itemId, onUpdateQuantity }: UpdateQuantityButtonsProps) {
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onUpdateQuantity(itemId, -1)}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onUpdateQuantity(itemId, 1)}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </>
  );
}
