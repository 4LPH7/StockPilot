import { Package } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl">StockPilot</h1>
      </div>
    </header>
  );
}
