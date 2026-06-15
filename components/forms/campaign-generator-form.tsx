"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

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
import type { GenerateCampaignResponse } from "@/lib/validators/generate-campaign";

export type CampaignBrandOption = {
  id: string;
  name: string;
  industry: string;
  toneOfVoice: string | null;
};

const platforms = ["Instagram", "TikTok", "Email", "Paid social", "Pinterest"];

const campaignTypes = [
  "Product launch",
  "Seasonal campaign",
  "Founder story",
  "Evergreen content",
  "Promotional offer",
];

const tones = [
  "Editorial and refined",
  "Warm and founder-led",
  "Minimal and polished",
  "Educational and calm",
  "Aspirational but grounded",
];

const outputSections = [
  {
    title: "Campaign concepts",
    description: "Core creative territories and launch angles.",
  },
  {
    title: "Captions",
    description: "Social-ready copy in your brand voice.",
  },
  {
    title: "Ad hooks",
    description: "Short lines for paid and organic placement.",
  },
  {
    title: "Image prompts",
    description: "Visual direction for mood, styling, and composition.",
  },
  {
    title: "Video ideas",
    description: "Short-form concepts for reels and stories.",
  },
  {
    title: "Content calendar ideas",
    description: "Sequenced moments for the campaign rollout.",
  },
];

const tips = [
  "Name the audience moment, not just the channel.",
  "Include product proof points that should appear in captions or hooks.",
  "Describe the visual feeling as if briefing a creative director.",
];

export function CampaignGeneratorForm({
  brands,
}: {
  brands: CampaignBrandOption[];
}) {
  const hasBrands = brands.length > 0;
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateCampaignResponse | null>(null);

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === selectedBrandId) ?? brands[0],
    [brands, selectedBrandId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      brandId: String(formData.get("brandId") ?? ""),
      campaignGoal: String(formData.get("campaignGoal") ?? ""),
      platform: String(formData.get("platform") ?? ""),
      campaignType: getOptionalValue(formData.get("campaignType")),
      productOrOffer: getOptionalValue(formData.get("productOrOffer")),
      audience: getOptionalValue(formData.get("audience")),
      keyMessage: getOptionalValue(formData.get("keyMessage")),
      desiredTone: getOptionalValue(formData.get("desiredTone")),
      timeline: getOptionalValue(formData.get("timeline")),
      additionalNotes: getOptionalValue(formData.get("additionalNotes")),
    };

    try {
      const response = await fetch("/api/campaigns/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: GenerateCampaignResponse | { error?: string } =
        await response.json();

      if (!response.ok) {
        setError(getFriendlyErrorMessage(response.status, data));
        return;
      }

      setResult(data as GenerateCampaignResponse);
    } catch {
      setError(
        "We couldn't reach the campaign generator. Check your connection and try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        {hasBrands ? (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {error ? (
              <div
                className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
                role="alert"
              >
                <p className="font-medium">Campaign generation failed</p>
                <p className="mt-1">{error}</p>
              </div>
            ) : null}

            {isGenerating ? (
              <div
                className="rounded-2xl border border-border/80 bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <p className="font-medium text-foreground">
                  Generating your campaign...
                </p>
                <p className="mt-1">
                  The studio is drafting concepts, captions, hooks, and visual
                  direction from your brand context. This usually takes a few
                  seconds.
                </p>
              </div>
            ) : null}

            <fieldset disabled={isGenerating} className="flex flex-col gap-6">
              <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
                <CardHeader>
                  <Badge variant="outline" className="w-fit bg-background/60">
                    Step 1 · Required details
                  </Badge>
                  <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                    Start with the essentials
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-base leading-7">
                    Choose the brand and describe what you want this campaign to
                    achieve. These three fields are required before generation
                    can begin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Brand"
                      htmlFor="brandId"
                      required
                      hint="Uses your saved brand voice, industry, and audience context."
                    >
                      <Select
                        id="brandId"
                        name="brandId"
                        defaultValue=""
                        required
                        onChange={(event) =>
                          setSelectedBrandId(event.currentTarget.value)
                        }
                      >
                        <option value="" disabled>
                          Select a brand
                        </option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field
                      label="Campaign goal"
                      htmlFor="campaignGoal"
                      required
                      hint="Describe the launch, moment, or business outcome."
                    >
                      <Input
                        id="campaignGoal"
                        name="campaignGoal"
                        placeholder="Launch a new summer collection"
                        required
                      />
                    </Field>
                  </div>

                  <Field
                    label="Platform"
                    htmlFor="platform"
                    required
                    hint="Where this campaign will primarily live."
                  >
                    <Select id="platform" name="platform" defaultValue="" required>
                      <option value="" disabled>
                        Choose a platform
                      </option>
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    Step 2 · Campaign context
                  </Badge>
                  <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                    Add optional brief details
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-base leading-7">
                    Optional fields help the studio tailor concepts, hooks, and
                    visual direction. Leave blank if you want a lighter brief.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Campaign type"
                      htmlFor="campaignType"
                      hint="Optional. Helps shape the campaign structure."
                    >
                      <Select
                        id="campaignType"
                        name="campaignType"
                        defaultValue=""
                      >
                        <option value="">Choose a campaign type</option>
                        {campaignTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field
                      label="Product or offer"
                      htmlFor="productOrOffer"
                      hint="Optional. Name the hero product or promotion."
                    >
                      <Input
                        id="productOrOffer"
                        name="productOrOffer"
                        placeholder="The Soft Structure Tote"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Target audience"
                      htmlFor="audience"
                      hint="Optional. Override or refine the brand audience for this campaign."
                    >
                      <Input
                        id="audience"
                        name="audience"
                        placeholder="Style-conscious founders and editors"
                      />
                    </Field>
                    <Field
                      label="Desired tone"
                      htmlFor="desiredTone"
                      hint="Optional. Adds tone guidance beyond the saved brand profile."
                    >
                      <Select
                        id="desiredTone"
                        name="desiredTone"
                        defaultValue=""
                      >
                        <option value="">Choose a tone</option>
                        {tones.map((tone) => (
                          <option key={tone} value={tone}>
                            {tone}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Field
                    label="Key message"
                    htmlFor="keyMessage"
                    hint="Optional. The main idea the campaign should communicate."
                  >
                    <textarea
                      id="keyMessage"
                      name="keyMessage"
                      rows={4}
                      placeholder="Explain the main idea the campaign should communicate."
                      className="w-full resize-none rounded-2xl border border-input bg-background/70 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </Field>

                  <Field
                    label="Launch date or timeline"
                    htmlFor="timeline"
                    hint="Optional. Useful for seasonal or timed launches."
                  >
                    <Input
                      id="timeline"
                      name="timeline"
                      placeholder="Late June launch, two-week rollout"
                    />
                  </Field>

                  <Field
                    label="Additional notes"
                    htmlFor="additionalNotes"
                    hint="Optional. Must-use phrases, references, exclusions, or internal context."
                  >
                    <textarea
                      id="additionalNotes"
                      name="additionalNotes"
                      rows={4}
                      placeholder="Add must-use phrases, creative references, exclusions, or internal context."
                      className="w-full resize-none rounded-2xl border border-input bg-background/70 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </Field>
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
                <CardHeader>
                  <Badge variant="outline" className="w-fit bg-background/60">
                    What you&apos;ll receive
                  </Badge>
                  <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                    Full campaign output set
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-base leading-7">
                    Each generation includes all sections below. Successful runs
                    are saved automatically to your campaign library.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {outputSections.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-3xl border border-border/75 bg-background/65 p-4"
                    >
                      <p className="font-heading text-lg font-semibold">
                        {section.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 rounded-3xl border border-border/80 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-background/60"
              >
                <Link href="/dashboard/campaigns">View campaign library</Link>
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={isGenerating}
              >
                {isGenerating
                  ? "Generating campaign..."
                  : "Generate and save campaign"}
              </Button>
            </div>
          </form>
        ) : (
          <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-background/60">
                Brand required
              </Badge>
              <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                Add a brand profile before generating
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                Campaign generation needs saved brand context — name, industry,
                voice, and audience — before it can build a useful brief.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link href="/dashboard/brands/new">Create brand profile</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-background/60"
              >
                <Link href="/dashboard/brands">View saved brands</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isGenerating ? (
          <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Generating
              </Badge>
              <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                Building your campaign output
              </CardTitle>
              <CardDescription>
                Your saved campaign preview will appear here when generation
                completes.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : result ? (
          <GeneratedOutputPreview result={result} />
        ) : (
          <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-background/60">
                Campaign preview
              </Badge>
              <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                Generated output will appear here
              </CardTitle>
              <CardDescription>
                Submit your brief to generate and save a campaign. You can then
                review the full output here or open it from your campaign
                library.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <Badge variant="outline" className="w-fit bg-background/60">
              Selected brand
            </Badge>
            <CardTitle className="font-heading text-2xl">
              {selectedBrand?.name ?? "Select a brand"}
            </CardTitle>
            <CardDescription>
              {selectedBrand
                ? `${selectedBrand.industry}${selectedBrand.toneOfVoice ? ` · ${selectedBrand.toneOfVoice}` : ""}`
                : "Choose a saved brand profile to shape the campaign brief."}
            </CardDescription>
          </CardHeader>
          {selectedBrand ? (
            <CardContent className="grid grid-cols-2 gap-3">
              {[selectedBrand.industry, "Brand context", "Saved profile"].map(
                (tag) => (
                  <Badge key={tag} variant="secondary" className="justify-center">
                    {tag}
                  </Badge>
                ),
              )}
            </CardContent>
          ) : null}
        </Card>

        <Card className="border-border/80 bg-primary text-primary-foreground shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Generation usage
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Each successful generation creates one saved campaign and records
              one AI usage event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">1</p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              generation per saved campaign.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Tips for stronger briefs
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

        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Saved campaigns
            </CardTitle>
            <CardDescription className="leading-6">
              Successful generations are saved automatically and linked to your
              selected brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full rounded-full bg-background/60">
              <Link href="/dashboard/campaigns">Open campaign library</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function GeneratedOutputPreview({
  result,
}: {
  result: GenerateCampaignResponse;
}) {
  const previewTitle =
    result.campaignConcepts[0] ?? "Generated campaign preview";

  const sections = [
    { title: "Campaign concepts", items: result.campaignConcepts },
    { title: "Captions", items: result.captions },
    { title: "Ad hooks", items: result.adHooks },
    { title: "Image prompts", items: result.imagePrompts },
    { title: "Video ideas", items: result.videoIdeas },
    {
      title: "Content calendar ideas",
      items: result.contentCalendarIdeas,
    },
  ];

  return (
    <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge variant="secondary" className="w-fit">
              Saved successfully
            </Badge>
            <CardTitle className="mt-3 font-heading text-3xl tracking-[-0.03em]">
              {previewTitle}
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-base leading-7">
              Your campaign was generated and saved to your library. Review the
              output below or open the full saved campaign page.
            </CardDescription>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <Link href={`/dashboard/campaigns/${result.campaignId}`}>
              View saved campaign
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {sections.map((section) => (
          <OutputGroup
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function OutputGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/65 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          No items were returned for this section.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="text-sm leading-6 text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getFriendlyErrorMessage(
  status: number,
  data: GenerateCampaignResponse | { error?: string },
): string {
  if ("error" in data && data.error) {
    return data.error;
  }

  if (status === 401) {
    return "Please sign in again before generating a campaign.";
  }

  if (status === 404) {
    return "The selected brand could not be found. Choose another brand or refresh the page.";
  }

  if (status === 400) {
    return "Check the required fields — brand, campaign goal, and platform — then try again.";
  }

  return "Something went wrong while generating your campaign. Please try again.";
}

function getOptionalValue(value: FormDataEntryValue | null) {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
}

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2" htmlFor={htmlFor}>
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-primary" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="text-xs leading-5 text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {children}
    </select>
  );
}
