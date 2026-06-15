"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updateBrand } from "@/app/dashboard/brands/[brandId]/actions";
import type { CreateBrandState } from "@/lib/validators/brand";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const industries = [
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Jewelry & Accessories",
  "Lifestyle & Wellness",
  "Home & Interiors",
  "Fragrance",
];

const tones = [
  "Editorial and refined",
  "Warm and founder-led",
  "Minimal and polished",
  "Playful but premium",
  "Calm and educational",
];

type BrandEditValues = {
  id: string;
  name: string;
  industry: string;
  toneOfVoice: string | null;
  targetAudience: string | null;
  colors: string[];
  fonts: string[];
};

export function BrandEditForm({ brand }: { brand: BrandEditValues }) {
  const updateBrandWithId = updateBrand.bind(null, brand.id);
  const [state, formAction, isPending] = useActionState(
    updateBrandWithId,
    {} satisfies CreateBrandState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.message ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Brand details</CardTitle>
          <CardDescription>
            Update the fields saved to your brand profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand name" htmlFor="name" error={state.errors?.name?.[0]}>
              <Input
                id="name"
                name="name"
                defaultValue={brand.name}
                required
                aria-invalid={!!state.errors?.name}
              />
            </Field>
            <Field
              label="Industry"
              htmlFor="industry"
              error={state.errors?.industry?.[0]}
            >
              <select
                id="industry"
                name="industry"
                defaultValue={brand.industry}
                className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                required
                aria-invalid={!!state.errors?.industry}
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tone of voice" htmlFor="toneOfVoice">
              <select
                id="toneOfVoice"
                name="toneOfVoice"
                defaultValue={brand.toneOfVoice ?? ""}
                className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Choose a tone</option>
                {tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target audience" htmlFor="targetAudience">
              <Input
                id="targetAudience"
                name="targetAudience"
                defaultValue={brand.targetAudience ?? ""}
                placeholder="Style-conscious founders, editors, and collectors"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand colors" htmlFor="colors" hint="Comma-separated values.">
              <Input
                id="colors"
                name="colors"
                defaultValue={brand.colors.join(", ")}
                placeholder="Ivory, cocoa, muted rose"
              />
            </Field>
            <Field label="Fonts" htmlFor="fonts" hint="Comma-separated values.">
              <Input
                id="fonts"
                name="fonts"
                defaultValue={brand.fonts.join(", ")}
                placeholder="Editorial serif, clean sans"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 rounded-3xl border border-border/80 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="rounded-full bg-background/60">
          <Link href="/dashboard/brands">Back to brands</Link>
        </Button>
        <Button type="submit" className="rounded-full" disabled={isPending}>
          {isPending ? "Saving changes..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2" htmlFor={htmlFor}>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-xs leading-5 text-muted-foreground">{hint}</span>
      ) : null}
      {error ? (
        <span className="text-xs leading-5 text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
