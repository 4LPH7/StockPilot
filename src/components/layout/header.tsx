"use client";

import { useState } from "react";
import { Package, Repeat, LogIn, LogOut, User as UserIcon } from "lucide-react";
import type { Currency } from "@/app/page";
import { Button } from "@/components/ui/button";
import { useFirebase, useUser } from "@/firebase";
import { initiateSignOut } from "@/firebase/non-blocking-login";
import { AuthDialog } from "@/components/auth/auth-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type HeaderProps = {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
};

export default function Header({ currency, onCurrencyChange }: HeaderProps) {
  const { auth } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleCurrencyToggle = () => {
    onCurrencyChange(currency === "INR" ? "USD" : "INR");
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await initiateSignOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been logged out of StockPilot.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: error.message,
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "G"; // Guest
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold md:text-xl tracking-tight">StockPilot</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCurrencyToggle}>
            <Repeat className="mr-2 h-4 w-4" />
            Switch to {currency === "INR" ? "USD" : "INR"}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || (user.isAnonymous ? "Guest User" : "Account")}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email || (user.isAnonymous ? "Temporary session" : user.uid)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => setAuthDialogOpen(true)} className="gap-2">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
