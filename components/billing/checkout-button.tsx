"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type CheckoutPlan = "PRO" | "AGENCY";

type CheckoutButtonProps = {
  plan: CheckoutPlan;
  label: string;
  variant?: "default" | "outline";
};

export function CheckoutButton({
  plan,
  label,
  variant = "default",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to start checkout.");
        return;
      }

      if (!data.url) {
        setError("Checkout URL was not returned.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        
        disabled={isLoading}
        onClick={handleCheckout}
      >
        {isLoading ? "Redirecting..." : label}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
