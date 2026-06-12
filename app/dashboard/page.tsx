import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const quickActions = [
  {
    title: "Create campaign",
    description: "Draft a launch concept, captions, hooks, and visual notes.",
  },
  {
    title: "Add brand",
    description: "Capture tone, audience, product category, and positioning.",
  },
  {
    title: "Upload brand kit",
    description: "Organize logos, guidelines, references, and product images.",
  },
];

const metrics = [
  { label: "Campaigns generated", value: "24", helper: "+6 this month" },
  { label: "Saved campaigns", value: "11", helper: "4 ready to refine" },
  { label: "Brand assets", value: "38", helper: "12 uploaded this week" },
  { label: "AI generations left", value: "126", helper: "Pro Studio plan" },
];

const recentCampaigns = [
  {
    name: "Summer Solstice Edit",
    brand: "Lumiere Atelier",
    status: "Ready",
    channel: "Instagram",
  },
  {
    name: "Holiday Gift Guide",
    brand: "Aster Jewelry",
    status: "Draft",
    channel: "Email",
  },
  {
    name: "Founder Story Series",
    brand: "Velvet Skin Co.",
    status: "Saved",
    channel: "TikTok",
  },
];

const contentIdeas = [
  "Turn product education into a three-part founder note.",
  "Pair soft studio stills with concise ad hooks for retargeting.",
  "Build one weekly content pillar around ritual, proof, and styling.",
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <Badge variant="outline" className="w-fit bg-background/60">
              Welcome back
            </Badge>
            <CardTitle className="font-heading text-4xl tracking-[-0.04em]">
              Good afternoon, Claire.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Your studio is ready with campaign ideas, brand context, and
              creative output waiting for review.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {quickActions.map((action) => (
              <div
                key={action.title}
                className="rounded-3xl border border-border/75 bg-background/65 p-5"
              >
                <h2 className="font-heading text-xl font-semibold">
                  {action.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {action.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-primary text-primary-foreground shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
              This week&apos;s studio focus
            </CardTitle>
            <CardDescription className="text-primary-foreground/75">
              Refine the visual language for your next launch before generating
              more captions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Review creative direction
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-border/80 bg-card/70 shadow-sm [--card-spacing:--spacing(5)]"
          >
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="font-heading text-4xl">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{metric.helper}</Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="font-heading text-2xl">
                  Recent campaigns
                </CardTitle>
                <CardDescription>
                  Static examples of saved campaign workspaces.
                </CardDescription>
              </div>
              <Button variant="outline" className="rounded-full bg-background/60">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentCampaigns.map((campaign) => (
              <div
                key={campaign.name}
                className="grid gap-3 rounded-3xl border border-border/70 bg-background/65 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
              >
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    {campaign.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.brand}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit bg-card/70">
                  {campaign.channel}
                </Badge>
                <Badge variant="secondary" className="w-fit">
                  {campaign.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Brand snapshot
            </CardTitle>
            <CardDescription>
              Mock brand context currently powering campaign drafts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-3xl border border-border/70 bg-background/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Primary brand
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                Lumiere Atelier
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Fashion", "Editorial", "Warm", "Minimal"].map((tag) => (
                <Badge key={tag} variant="secondary" className="justify-center">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Upcoming content ideas
            </CardTitle>
            <CardDescription>
              Editorial prompts to support this month&apos;s planning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {contentIdeas.map((idea) => (
                <li
                  key={idea}
                  className="rounded-3xl border border-border/70 bg-background/65 p-4 text-sm leading-6 text-muted-foreground"
                >
                  {idea}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <Badge variant="outline" className="w-fit bg-background/60">
              Creative output preview
            </Badge>
            <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
              Campaign concept: The Quiet Launch Edit
            </CardTitle>
            <CardDescription>
              Static mock output only. No AI generation is connected.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <PreviewBlock
              label="Campaign concept"
              value="A refined launch story around slower mornings, material detail, and thoughtful product education."
            />
            <PreviewBlock
              label="Caption"
              value="A considered edit for pieces that make everyday routines feel quietly elevated."
            />
            <PreviewBlock
              label="Ad hook"
              value="Campaign direction without the blank page."
            />
            <PreviewBlock
              label="Visual direction"
              value="Warm ivory surface, soft studio shadows, close crop product details, restrained editorial styling."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function PreviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/65 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-sm leading-7 text-foreground">{value}</p>
    </div>
  );
}
