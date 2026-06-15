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
import { requireCurrentUserId } from "@/lib/auth/authorization";
import type { CampaignStatus } from "@/lib/db/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

function formatStatus(status: CampaignStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatCreatedDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    date,
  );
}

function getCampaignPreview(aiOutput: unknown): string | null {
  if (!aiOutput || typeof aiOutput !== "object") {
    return null;
  }

  const output = aiOutput as Record<string, unknown>;

  for (const key of ["campaignConcepts", "captions", "adHooks"] as const) {
    const value = output[key];
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
      return value[0].trim();
    }
  }

  return null;
}

function truncatePreview(text: string, maxLength = 140): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

export default async function CampaignLibraryPage() {
  const userId = await requireCurrentUserId();

  const campaigns = await prisma.campaign.findMany({
    where: {
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Campaign library
          </p>
          <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Saved campaigns
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            Review campaigns generated for your brands. New ideas are saved here
            after each successful generation.
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-full">
          <Link href="/dashboard/campaigns/new">New campaign</Link>
        </Button>
      </section>

      {campaigns.length === 0 ? (
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CardTitle className="font-heading text-2xl">No campaigns yet</CardTitle>
            <CardDescription className="mt-3 max-w-md text-base leading-7">
              Generate your first campaign from a saved brand profile. Completed
              generations will appear here for review.
            </CardDescription>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/dashboard/campaigns/new">Create campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {campaigns.map((campaign) => {
            const preview = getCampaignPreview(campaign.aiOutput);

            return (
              <Card
                key={campaign.id}
                className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]"
              >
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="font-heading text-xl font-semibold">
                        <Link
                          href={`/dashboard/campaigns/${campaign.id}`}
                          className="hover:underline"
                        >
                          {campaign.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {campaign.brand.name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-background/60">
                        {campaign.platform}
                      </Badge>
                      <Badge variant="secondary">
                        {formatStatus(campaign.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    {preview ? (
                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                          Preview
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {truncatePreview(preview)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
