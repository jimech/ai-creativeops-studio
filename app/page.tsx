import Link from "next/link";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "AI campaign concepts",
    description:
      "Turn a product drop, launch moment, or seasonal idea into polished campaign territories.",
  },
  {
    title: "Captions and ad hooks",
    description:
      "Generate social captions, scroll-stopping hooks, and paid creative angles in your brand voice.",
  },
  {
    title: "Brand kit context",
    description:
      "Use tone, audience, industry, colors, and product details to keep outputs aligned.",
  },
  {
    title: "Saved campaign library",
    description:
      "Keep approved ideas, hooks, prompts, and content plans organized for later refinement.",
  },
  {
    title: "Visual direction prompts",
    description:
      "Create image prompt directions for mood, lighting, styling, composition, and campaign feel.",
  },
  {
    title: "Content calendar ideas",
    description:
      "Move from one campaign idea into a practical sequence of social and email moments.",
  },
];

const steps = [
  "Add your brand",
  "Enter campaign goal",
  "Generate creative direction",
  "Save and refine",
];

const campaignConcepts = [
  "A soft-launch editorial story built around quiet luxury rituals.",
  "A founder-led product education series for social and email.",
  "A seasonal gift guide campaign with high-intent ad angles.",
];

const captions = [
  "For the pieces that make everyday routines feel considered.",
  "A slower kind of launch - designed for the customer who notices detail.",
  "Your next campaign direction, shaped in minutes and refined by your team.",
];

const adHooks = [
  "Your brand voice, without the blank page.",
  "Campaign planning for lean creative teams.",
  "From product idea to polished creative direction.",
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Explore the studio and generate a limited set of ideas.",
  },
  {
    name: "Pro",
    price: "$29",
    description: "For founders and lean teams creating campaigns every month.",
  },
  {
    name: "Agency",
    price: "$89",
    description: "For teams managing multiple brands and client campaigns.",
  },
];

export default async function Home() {
  const session = await auth();
  const billingHref = session ? "/dashboard/billing" : "/sign-in";

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between rounded-3xl border border-border/80 bg-card/70 px-4 py-3 shadow-sm backdrop-blur md:px-6">
          <a href="#" className="flex flex-col leading-none">
            <span className="font-heading text-lg font-semibold tracking-tight">
              ai-creativeops-studio
            </span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
              AI creative operations
            </span>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>
          <Button asChild className="rounded-full px-5">
            <Link href="/sign-in">Sign in to start</Link>
          </Button>
        </nav>

        <section className="grid gap-12 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="flex flex-col gap-8">
            <Badge
              variant="outline"
              className="w-fit border-primary/20 bg-card/70 px-3 py-1 text-primary"
            >
              Built for modern creative teams
            </Badge>
            <div className="flex flex-col gap-6">
              <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-foreground sm:text-6xl lg:text-7xl">
                AI-powered creative operations for high-touch brands.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                ai-creativeops-studio helps fashion, beauty, jewelry, and
                lifestyle teams generate campaign ideas, captions, hooks, and
                visual direction faster - without losing the nuance of brand
                voice.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/sign-in">Sign in to start</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full bg-card/60 px-7"
              >
                <a href="#demo">View demo</a>
              </Button>
            </div>
            <div className="grid max-w-2xl grid-cols-3 gap-3 pt-2">
              {["Campaigns", "Captions", "Visuals"].map((label, index) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/80 bg-card/60 p-4"
                >
                  <p className="font-heading text-2xl font-semibold">
                    {index === 0 ? "12+" : index === 1 ? "30+" : "8"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card
            id="demo"
            className="relative border-border/80 bg-card/85 shadow-2xl shadow-primary/10 [--card-spacing:--spacing(6)]"
          >
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-heading text-2xl">
                    Summer Glow Launch
                  </CardTitle>
                  <CardDescription>
                    Mock AI campaign output for a clean beauty brand.
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary">Generated</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="rounded-3xl border border-border/80 bg-secondary/45 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Creative angle
                </p>
                <p className="mt-3 font-heading text-3xl font-semibold leading-tight">
                  A sunlit ritual for the customer who wants glow without rush.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Caption
                  </p>
                  <p className="mt-3 text-sm leading-6">
                    Meet the three-step ritual designed for warmer mornings and
                    softer skin days.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Visual prompt
                  </p>
                  <p className="mt-3 text-sm leading-6">
                    Ivory set, champagne light, macro texture, editorial still
                    life, quiet luxury.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Instagram", "Email", "Paid social", "Content calendar"].map(
                  (item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <section className="border-y border-border/70 bg-card/40">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            The operating gap
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-[-0.03em]">
                Small creative brands need agency-level thinking without agency
                overhead.
              </h2>
            </div>
            <p className="text-base leading-8 text-muted-foreground">
              Founders and lean teams are expected to plan campaigns across
              social, email, launches, and ads, but the blank page slows
              momentum. ai-creativeops-studio gives them a calm workspace for
              campaign ideas, captions, ad hooks, and visual direction.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mb-10 flex max-w-3xl flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-card/60">
            Features
          </Badge>
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Everything a lean creative team needs to move from idea to direction.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/80 bg-card/70 shadow-sm [--card-spacing:--spacing(5)]"
            >
              <CardHeader>
                <CardTitle className="font-heading text-xl">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10"
      >
        <div className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col gap-4">
              <Badge variant="secondary" className="w-fit">
                How it works
              </Badge>
              <h2 className="font-heading text-4xl font-semibold tracking-[-0.04em]">
                Guided creative operations in four calm steps.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-3xl border border-border/70 bg-background/65 p-5"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 font-heading text-2xl font-semibold">
                    {step}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {index === 0 &&
                      "Capture tone, audience, category, and product context."}
                    {index === 1 &&
                      "Describe the launch, channel, moment, or business goal."}
                    {index === 2 &&
                      "Receive campaign concepts, hooks, captions, and prompts."}
                    {index === 3 &&
                      "Keep the strongest ideas for planning and refinement."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
        <div className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit bg-card/60">
            Example output
          </Badge>
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.04em]">
            A campaign draft your team can actually use.
          </h2>
          <p className="leading-8 text-muted-foreground">
            Static sample content shows the intended MVP output shape without
            connecting to AI or a database.
          </p>
        </div>
        <Card className="border-border/80 bg-card/80 [--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Campaign: The Quiet Launch Edit
            </CardTitle>
            <CardDescription>
              Mock campaign direction for a premium lifestyle product launch.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            <OutputList title="Campaign concepts" items={campaignConcepts} />
            <OutputList title="Captions" items={captions} />
            <OutputList title="Ad hooks" items={adHooks} />
          </CardContent>
        </Card>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 text-center">
          <Badge variant="secondary" className="mx-auto">
            Pricing preview
          </Badge>
          <h2 className="mx-auto max-w-3xl font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Start small, then scale your creative operations.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]"
            >
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <p className="font-heading text-4xl font-semibold">
                  {plan.price}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full bg-background/60"
                >
                  <Link href={billingHref}>
                    {session ? "View plans & billing" : "Sign in to view plans"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="rounded-[2.25rem] border border-border/80 bg-primary px-6 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/15 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] opacity-75">
            Ready for your next campaign
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Sign in and start building campaign ideas in the studio.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 opacity-80">
            Create a free account with Google, add your brand context, and
            generate your first saved campaign from the dashboard.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 rounded-full bg-primary-foreground px-7 text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/sign-in">Sign in to start creating</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function OutputList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background/65 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
