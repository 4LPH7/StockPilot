"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import {
  initiateGoogleSignIn,
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateAnonymousSignIn,
} from "@/firebase/non-blocking-login";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, UserCheck, Chrome, AlertTriangle } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getAuthErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const code = error.code || "";

  switch (code) {
    case "auth/unauthorized-domain":
      const host = typeof window !== "undefined" ? window.location.hostname : "invisto.netlify.app";
      return `Domain "${host}" is not authorized. Add "${host}" to Firebase Console > Authentication > Settings > Authorized domains.`;
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
    case "auth/user-not-found":
      return "No account found with this email. Please create an account.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already in use. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/operation-not-allowed":
      return "This sign-in provider is disabled in Firebase Console. Enable it in Authentication > Sign-in method.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return error.message || "Authentication failed.";
  }
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [domainError, setDomainError] = useState(false);

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    setDomainError(false);
    try {
      await initiateGoogleSignIn(auth);
      toast({
        title: "Signed In",
        description: "Welcome to StockPilot!",
      });
      onOpenChange(false);
    } catch (error: any) {
      if (error?.code === "auth/unauthorized-domain") {
        setDomainError(true);
      }
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    setLoading(true);
    try {
      await initiateEmailSignIn(auth, email, password);
      toast({
        title: "Signed In",
        description: "Welcome back to StockPilot!",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email || !password) return;
    setLoading(true);
    try {
      await initiateEmailSignUp(auth, email, password);
      toast({
        title: "Account Created",
        description: "Your StockPilot account is ready!",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await initiateAnonymousSignIn(auth);
      toast({
        title: "Signed In as Guest",
        description: "Exploring in temporary sandbox mode.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Guest Sign In Failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Sign In to StockPilot</DialogTitle>
          <DialogDescription>
            Access your private inventory and real-time stock telemetry.
          </DialogDescription>
        </DialogHeader>

        {domainError && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Domain Not Authorized in Firebase</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-amber-200/90">
              Firebase blocked Google Sign-In because <strong>{typeof window !== "undefined" ? window.location.hostname : "this domain"}</strong> has not been authorized yet.
            </p>
            <div className="mt-2 text-[11px] text-amber-300/80 bg-background/50 p-2 rounded border border-amber-500/20">
              <strong>To fix this:</strong> Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains &rarr; Add <em>{typeof window !== "undefined" ? window.location.hostname : "invisto.netlify.app"}</em>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 py-2">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-5"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="h-5 w-5 text-red-500" />
            <span>Continue with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or with Email
              </span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="pt-2 border-t text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleGuestSignIn}
              disabled={loading}
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
              Continue as Guest (temporary sandbox)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
