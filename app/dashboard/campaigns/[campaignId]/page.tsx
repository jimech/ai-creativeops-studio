import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentUserId } from "@/lib/auth/authorization";
import type { CampaignStatus } from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const AI_OUTPUT_SECTIONS = [
  { key: "campaignConcepts", title: "Campaign concepts" },
  { key: "captions", title: "Captions" },
  { key: "adHooks", title: "Ad hooks" },
  { key: "imagePrompts", title: "Image prompts" },
  { key: "videoIdeas", title: "Video ideas" },
  { key: "contentCalendarIdeas", title: "Content calendar ideas" },
] as const;

type AiOutputSectionKey = (typeof AI_OUTPUT_SECTIONS)[number]["key"];

function formatStatus(status: CampaignStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatCreatedDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    date,
  );
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
}

function parseAiOutputSections(
  aiOutput: unknown,
): Record<AiOutputSectionKey, string[]> {
  const sections = Object.fromEntries(
    AI_OUTPUT_SECTIONS.map(({ key }) => [key, [] as string[]]),
  ) as Record<AiOutputSectionKey, string[]>;

  if (!aiOutput || typeof aiOutput !== "object") {
    return sections;
  }

  const output = aiOutput as Record<string, unknown>;

  for (const { key } of AI_OUTPUT_SECTIONS) {
    sections[key] = parseStringArray(output[key]);
  }

  return sections;
}

function hasAnyOutput(sections: Record<AiOutputSectionKey, string[]>): boolean {
  return AI_OUTPUT_SECTIONS.some(({ key }) => sections[key].length > 0);
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const userId = await requireCurrentUserId();

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      brand: { ownerId: userId },
    },
    select: {
      id: true,
      title: true,
      goal: true,
      platform: true,
      status: true,
      aiOutput: true,
      createdAt: true,
      brand: {
        select: { name: true },
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const outputSections = parseAiOutputSections(campaign.aiOutput);
  const hasOutput = hasAnyOutput(outputSections);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <Button asChild variant="outline" className="mb-4 rounded-full bg-background/60">
            <Link href="/dashboard/campaigns">Back to library</Link>
          </Button>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Campaign detail
          </p>
          <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {campaign.title}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            {campaign.brand.name} · {campaign.platform} ·{" "}
            {formatCreatedDate(campaign.createdAt)}
          </p>
        </div>
        <Badge variant="secondary" className="w-fit shrink-0">
          {formatStatus(campaign.status)}
        </Badge>
      </section>

      <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-semibold">
            Campaign overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Brand
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {campaign.brand.name}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Platform
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {campaign.platform}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Goal
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {campaign.goal}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Created
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {formatCreatedDate(campaign.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
        <CardHeader>
          <Badge variant="outline" className="w-fit bg-background/60">
            Generated output
          </Badge>
          <CardTitle className="font-heading text-2xl tracking-[-0.03em]">
            AI campaign output
          </CardTitle>
          <CardDescription>
            Saved concepts, captions, hooks, and creative direction from
            generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasOutput ? (
            <p className="rounded-3xl border border-dashed border-border/80 bg-background/65 p-8 text-center text-sm leading-6 text-muted-foreground">
              No AI output is available for this campaign yet.
            </p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {AI_OUTPUT_SECTIONS.map(({ key, title }) => (
                <OutputGroup
                  key={key}
                  title={title}
                  items={outputSections[key]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
          No items available.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="text-sm leading-6 text-foreground">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
