"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ManageBillingButtonProps = {
  label?: string;
  variant?: "default" | "outline";
};

export function ManageBillingButton({
  label = "Manage billing",
  variant = "outline",
}: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManageBilling() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to open billing portal.");
        return;
      }

      if (!data.url) {
        setError("Billing portal URL was not returned.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Unable to open billing portal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        className="rounded-full"
        disabled={isLoading}
        onClick={handleManageBilling}
      >
        {isLoading ? "Opening portal..." : label}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
