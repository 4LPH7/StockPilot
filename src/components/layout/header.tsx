import { Package, Repeat } from "lucide-react";
import type { Currency } from "@/app/page";
import { Button } from "@/components/ui/button";

type HeaderProps = {
    currency: Currency;
    onCurrencyChange: (currency: Currency) => void;
};

export default function Header({ currency, onCurrencyChange }: HeaderProps) {

  const handleCurrencyToggle = () => {
    onCurrencyChange(currency === 'INR' ? 'USD' : 'INR');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl">StockPilot</h1>
      </div>
       <Button variant="outline" size="sm" onClick={handleCurrencyToggle}>
        <Repeat className="mr-2 h-4 w-4" />
        Switch to {currency === 'INR' ? 'USD' : 'INR'}
      </Button>
    </header>
  );
}
