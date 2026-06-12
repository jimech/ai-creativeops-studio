import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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

const progressItems = [
  "Brand basics",
  "Voice and audience",
  "Visual identity",
  "Product context",
  "Brand assets",
];

const tips = [
  "Share details a creative director would need before writing a campaign brief.",
  "Use concrete tone words instead of broad phrases like premium or modern.",
  "Add product context that explains why customers care now.",
];

const nextSteps = [
  "Review your saved brand profile.",
  "Use the brand context in the campaign generator.",
  "Refine outputs in your saved campaign library.",
];

export function BrandOnboardingForm() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <form className="flex min-w-0 flex-col gap-6">
        <OnboardingSection
          eyebrow="Brand basics"
          title="Start with the essentials."
          description="These details frame the brand before campaign ideas are generated."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand name" htmlFor="brand-name">
              <Input
                id="brand-name"
                name="brand-name"
                placeholder="Lumiere Atelier"
                required
              />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <select
                id="industry"
                name="industry"
                defaultValue=""
                className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                required
              >
                <option value="" disabled>
                  Select an industry
                </option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Website or Instagram handle" htmlFor="brand-url">
            <Input
              id="brand-url"
              name="brand-url"
              placeholder="@lumiereatelier or https://lumiere.example"
            />
          </Field>
        </OnboardingSection>

        <OnboardingSection
          eyebrow="Brand voice"
          title="Define how the brand should sound."
          description="Voice context helps the studio keep captions, hooks, and creative direction aligned."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tone of voice" htmlFor="tone">
              <select
                id="tone"
                name="tone"
                defaultValue=""
                className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  Choose a tone
                </option>
                {tones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target audience" htmlFor="target-audience">
              <Input
                id="target-audience"
                name="target-audience"
                placeholder="Style-conscious founders, editors, and collectors"
              />
            </Field>
          </div>
          <Field label="Brand description" htmlFor="brand-description">
            <textarea
              id="brand-description"
              name="brand-description"
              rows={5}
              placeholder="Describe the brand's world, point of view, customer, and creative standards."
              className="w-full resize-none rounded-2xl border border-input bg-background/70 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Field>
        </OnboardingSection>

        <OnboardingSection
          eyebrow="Visual identity"
          title="Capture the look and feeling."
          description="Use simple lists for now. The MVP can turn these notes into visual prompts later."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Brand colors" htmlFor="brand-colors">
              <Input
                id="brand-colors"
                name="brand-colors"
                placeholder="Ivory, cocoa, muted rose"
              />
            </Field>
            <Field label="Fonts" htmlFor="fonts">
              <Input
                id="fonts"
                name="fonts"
                placeholder="Editorial serif, clean sans"
              />
            </Field>
            <Field label="Style keywords" htmlFor="style-keywords">
              <Input
                id="style-keywords"
                name="style-keywords"
                placeholder="Quiet luxury, tactile, minimal"
              />
            </Field>
          </div>
        </OnboardingSection>

        <OnboardingSection
          eyebrow="Product context"
          title="Add the product details campaigns need."
          description="This helps future campaign ideas stay grounded in what the brand actually sells."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Main product name" htmlFor="product-name">
              <Input
                id="product-name"
                name="product-name"
                placeholder="The Soft Structure Tote"
              />
            </Field>
            <Field label="Price range" htmlFor="price-range">
              <Input
                id="price-range"
                name="price-range"
                placeholder="$150 - $350"
              />
            </Field>
          </div>
          <Field label="Product description" htmlFor="product-description">
            <textarea
              id="product-description"
              name="product-description"
              rows={4}
              placeholder="Summarize materials, benefits, use cases, customer motivations, and what makes the product distinct."
              className="w-full resize-none rounded-2xl border border-input bg-background/70 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </Field>
        </OnboardingSection>

        <OnboardingSection
          eyebrow="Brand assets"
          title="Prepare the creative references."
          description="These upload areas are visual placeholders only. File upload logic will be added later."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <AssetPlaceholder
              title="Upload logo"
              description="PNG, SVG, or JPG placeholder"
            />
            <AssetPlaceholder
              title="Upload product images"
              description="Editorial and ecommerce references"
            />
            <AssetPlaceholder
              title="Upload brand guidelines"
              description="PDF or document placeholder"
            />
          </div>
        </OnboardingSection>

        <div className="flex flex-col-reverse gap-3 rounded-3xl border border-border/80 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" className="rounded-full">
              Save as draft
            </Button>
            <Button type="button" className="rounded-full">
              Save brand profile
            </Button>
          </div>
        </div>
      </form>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Onboarding progress
            </Badge>
            <CardTitle className="font-heading text-2xl">
              Brand profile draft
            </CardTitle>
            <CardDescription>
              Complete each section to give future campaign outputs better
              context.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {progressItems.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Tips for better AI output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="rounded-2xl border border-border/70 bg-background/65 p-3 text-sm leading-6 text-muted-foreground"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-primary text-primary-foreground shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              What happens next
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              This is static UI for now. Later tickets will connect the workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm leading-6 text-primary-foreground/85">
              {nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function OnboardingSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
        <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
          {title}
        </CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2" htmlFor={htmlFor}>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function AssetPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-background/65 p-5 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        UI only
      </span>
      <h3 className="mt-3 font-heading text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
