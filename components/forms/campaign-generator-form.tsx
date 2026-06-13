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

const outputOptions = [
  "Campaign concepts",
  "Captions",
  "Ad hooks",
  "Image prompts",
  "Video ideas",
  "Content calendar ideas",
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
        setResult(null);
        setError(
          "error" in data && data.error
            ? data.error
            : "Campaign generation failed. Please try again.",
        );
        return;
      }

      setResult(data as GenerateCampaignResponse);
    } catch {
      setResult(null);
      setError("Campaign generation failed. Please try again.");
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
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
              <CardHeader>
                <Badge variant="outline" className="w-fit bg-background/60">
                  Campaign brief
                </Badge>
                <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                  Tell the studio what you want to create.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  Submit your brief to generate campaign concepts, captions,
                  hooks, and visual direction from your saved brand context.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Brand" htmlFor="brandId">
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
                  <Field label="Campaign goal" htmlFor="campaignGoal">
                    <Input
                      id="campaignGoal"
                      name="campaignGoal"
                      placeholder="Launch a new summer collection"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Platform" htmlFor="platform">
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
                  <Field label="Campaign type" htmlFor="campaignType">
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Product or offer" htmlFor="productOrOffer">
                    <Input
                      id="productOrOffer"
                      name="productOrOffer"
                      placeholder="The Soft Structure Tote"
                    />
                  </Field>
                  <Field label="Target audience" htmlFor="audience">
                    <Input
                      id="audience"
                      name="audience"
                      placeholder="Style-conscious founders and editors"
                    />
                  </Field>
                </div>

                <Field label="Key message" htmlFor="keyMessage">
                  <textarea
                    id="keyMessage"
                    name="keyMessage"
                    rows={4}
                    placeholder="Explain the main idea the campaign should communicate."
                    className="w-full resize-none rounded-2xl border border-input bg-background/70 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Desired tone" htmlFor="desiredTone">
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
                  <Field label="Launch date or timeline" htmlFor="timeline">
                    <Input
                      id="timeline"
                      name="timeline"
                      placeholder="Late June launch, two-week rollout"
                    />
                  </Field>
                </div>

                <Field label="Additional notes" htmlFor="additionalNotes">
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
                <Badge variant="secondary" className="w-fit">
                  Output options
                </Badge>
                <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                  Choose what the generated preview should include.
                </CardTitle>
                <CardDescription>
                  These controls are UI-only for now. Generation includes the
                  full campaign output set.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {outputOptions.map((option, index) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-start gap-3 rounded-3xl border border-border/75 bg-background/65 p-4"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index < 4}
                      className="mt-1 size-4 accent-primary"
                    />
                    <span>
                      <span className="block font-heading text-xl font-semibold">
                        {option}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                        Include {option.toLowerCase()} in the generated campaign
                        preview.
                      </span>
                    </span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse gap-3 rounded-3xl border border-border/80 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-background/60"
              >
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="outline" className="rounded-full">
                  Save draft
                </Button>
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating campaign..." : "Generate campaign"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-background/60">
                Brand required
              </Badge>
              <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                Create a brand profile first
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                Campaign generation needs brand context before you can build a
                brief. Add your brand name, industry, voice, and visual notes to
                get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full">
                <Link href="/dashboard/brands/new">Create brand profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {result ? (
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
                Submit your brief to generate and save a campaign preview.
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
              AI usage preview
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Usage tracking and plan limits will be added in a later ticket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">1</p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              generation is used when you create a campaign.
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

  return (
    <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
      <CardHeader>
        <Badge variant="outline" className="w-fit bg-background/60">
          Generated output
        </Badge>
        <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
          {previewTitle}
        </CardTitle>
        <CardDescription>
          Campaign saved successfully. Review the generated concepts, captions,
          hooks, and visual direction below.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <OutputGroup title="Campaign concepts" items={result.campaignConcepts} />
        <OutputGroup title="Captions" items={result.captions} />
        <OutputGroup title="Ad hooks" items={result.adHooks} />
        <OutputGroup title="Image prompts" items={result.imagePrompts} />
        <OutputGroup title="Video ideas" items={result.videoIdeas} />
        <OutputGroup
          title="Content calendar ideas"
          items={result.contentCalendarIdeas}
        />
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
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getOptionalValue(value: FormDataEntryValue | null) {
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
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

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      {...props}
    >
      {children}
    </select>
  );
}
