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

const concepts = [
  "The Quiet Launch Edit: a calm editorial rollout focused on craftsmanship, material detail, and slower purchase consideration.",
  "Rituals Before Reach: a founder-led content story that frames the product as part of a more intentional daily routine.",
];

const captions = [
  "A considered launch for the pieces that make everyday rituals feel more composed.",
  "Meet the edit designed for softer mornings, sharper details, and a slower kind of luxury.",
  "From first sketch to final styling note, this campaign starts with the brand story.",
];

const hooks = [
  "The campaign direction your next launch needs before the first post is written.",
  "Turn product context into a polished creative angle in minutes.",
  "For brands that need agency-level thinking without agency overhead.",
];

const imagePrompts = [
  "Warm ivory backdrop, low morning light, close crop product detail, restrained editorial styling.",
  "Taupe studio set, soft shadow, textured paper, premium lifestyle still life, quiet composition.",
];

const videoIdeas = [
  "Founder voiceover walking through the product ritual in three slow, tactile shots.",
  "Short-form styling sequence: product detail, use moment, final editorial frame.",
];

const calendarIdeas = [
  "Monday: campaign concept reveal with founder note.",
  "Wednesday: product education carousel with proof points.",
  "Friday: visual direction post with image prompt-inspired stills.",
];

export function CampaignGeneratorForm({
  brands,
}: {
  brands: CampaignBrandOption[];
}) {
  const hasBrands = brands.length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-6">
        {hasBrands ? (
          <form className="flex flex-col gap-6">
            <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
              <CardHeader>
                <Badge variant="outline" className="w-fit bg-background/60">
                  Campaign brief
                </Badge>
                <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
                  Tell the studio what you want to create.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  Use static mock inputs to shape campaign concepts, captions,
                  hooks, and visual direction. No AI request is sent yet.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Brand" htmlFor="brand">
                    <Select id="brand" name="brand" defaultValue="" required>
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
                <Field label="Campaign goal" htmlFor="campaign-goal">
                  <Input
                    id="campaign-goal"
                    name="campaign-goal"
                    placeholder="Launch a new summer collection"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Platform" htmlFor="platform">
                  <Select id="platform" name="platform" defaultValue="">
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
                <Field label="Campaign type" htmlFor="campaign-type">
                  <Select id="campaign-type" name="campaign-type" defaultValue="">
                    <option value="" disabled>
                      Choose a campaign type
                    </option>
                    {campaignTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Product or offer" htmlFor="product-offer">
                  <Input
                    id="product-offer"
                    name="product-offer"
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

              <Field label="Key message" htmlFor="key-message">
                <textarea
                  id="key-message"
                  name="key-message"
                  rows={4}
                  placeholder="Explain the main idea the campaign should communicate."
                  className="w-full resize-none rounded-2xl border border-input bg-background/70 px-3 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Desired tone" htmlFor="desired-tone">
                  <Select id="desired-tone" name="desired-tone" defaultValue="">
                    <option value="" disabled>
                      Choose a tone
                    </option>
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

              <Field label="Additional notes" htmlFor="additional-notes">
                <textarea
                  id="additional-notes"
                  name="additional-notes"
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
                Choose what the static preview should include.
              </CardTitle>
              <CardDescription>
                These controls are UI-only placeholders for the future generator.
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
            <Button asChild variant="outline" className="rounded-full bg-background/60">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="rounded-full">
                Save draft
              </Button>
              <Button type="button" className="rounded-full">
                Generate campaign
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

        <StaticOutputPreview />
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <Badge variant="outline" className="w-fit bg-background/60">
              Selected brand
            </Badge>
            <CardTitle className="font-heading text-2xl">
              Lumiere Atelier
            </CardTitle>
            <CardDescription>
              Mock brand profile for a refined fashion and lifestyle label.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {["Fashion", "Editorial", "Warm", "Minimal"].map((tag) => (
              <Badge key={tag} variant="secondary" className="justify-center">
                {tag}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-primary text-primary-foreground shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              AI usage preview
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Static usage estimate for future plan limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-semibold">1</p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              generation would be used when this becomes connected.
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
              Static UI only
            </CardTitle>
            <CardDescription className="leading-6">
              Brand options come from your saved profiles. This screen does not
              call OpenAI or save campaigns yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </aside>
    </div>
  );
}

function StaticOutputPreview() {
  return (
    <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
      <CardHeader>
        <Badge variant="outline" className="w-fit bg-background/60">
          Static sample output
        </Badge>
        <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
          Campaign preview: The Quiet Launch Edit
        </CardTitle>
        <CardDescription>
          Example output only. This preview is hard-coded for the MVP design
          ticket.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        <OutputGroup title="Campaign concepts" items={concepts} />
        <OutputGroup title="Captions" items={captions} />
        <OutputGroup title="Ad hooks" items={hooks} />
        <OutputGroup title="Image prompts" items={imagePrompts} />
        <OutputGroup title="Video ideas" items={videoIdeas} />
        <OutputGroup title="Content calendar ideas" items={calendarIdeas} />
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
