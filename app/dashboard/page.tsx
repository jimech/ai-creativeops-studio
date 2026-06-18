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

export default async function DashboardPage() {
  const userId = await requireCurrentUserId();

  const [
    brandCount,
    campaignCount,
    aiUsageCount,
    recentCampaigns,
    recentBrands,
  ] = await Promise.all([
    prisma.brand.count({ where: { ownerId: userId } }),
    prisma.campaign.count({ where: { brand: { ownerId: userId } } }),
    prisma.aiUsage.count({ where: { userId } }),
    prisma.campaign.findMany({
      where: { brand: { ownerId: userId } },
      select: {
        id: true,
        title: true,
        platform: true,
        status: true,
        createdAt: true,
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.brand.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        industry: true,
        toneOfVoice: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <Badge variant="outline" className="w-fit bg-background/60">
          Dashboard
        </Badge>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Welcome back
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Your studio overview with saved brands, campaigns, and recent AI
          generation activity.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/campaigns/new">New campaign</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard/brands/new">Create brand</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard/campaigns">View campaign library</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard/brands">View brand profiles</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardDescription>Brand profiles</CardDescription>
            <CardTitle className="font-heading text-4xl">{brandCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Saved brands powering campaign generation.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardDescription>Campaigns</CardDescription>
            <CardTitle className="font-heading text-4xl">
              {campaignCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generated campaigns across your brands.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]">
          <CardHeader>
            <CardDescription>AI generations</CardDescription>
            <CardTitle className="font-heading text-4xl">{aiUsageCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recorded generation events for your account.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="font-heading text-2xl">
                  Recent campaigns
                </CardTitle>
                <CardDescription>
                  Your latest saved campaign output.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="rounded-full bg-background/60">
                <Link href="/dashboard/campaigns">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-background/65 p-8 text-center">
                <p className="font-heading text-lg font-semibold">
                  No campaigns yet
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Generate your first campaign from a saved brand profile.
                </p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/dashboard/campaigns/new">Generate campaign</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="grid gap-3 rounded-3xl border border-border/70 bg-background/65 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <h3 className="font-heading text-lg font-semibold">
                        <Link
                          href={`/dashboard/campaigns/${campaign.id}`}
                          className="hover:underline"
                        >
                          {campaign.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {campaign.brand.name} · {formatCreatedDate(campaign.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit bg-card/70">
                      {campaign.platform}
                    </Badge>
                    <Badge variant="secondary" className="w-fit">
                      {formatStatus(campaign.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="font-heading text-2xl">
                  Brand profiles
                </CardTitle>
                <CardDescription>
                  Saved brand context for generation.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="rounded-full bg-background/60">
                <Link href="/dashboard/brands">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentBrands.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-background/65 p-8 text-center">
                <p className="font-heading text-lg font-semibold">
                  No brand profiles yet
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create a brand profile before generating campaigns.
                </p>
                <Button asChild className="mt-4 rounded-full">
                  <Link href="/dashboard/brands/new">Create brand</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="rounded-3xl border border-border/70 bg-background/65 p-4"
                  >
                    <h3 className="font-heading text-lg font-semibold">
                      <Link
                        href={`/dashboard/brands/${brand.id}`}
                        className="hover:underline"
                      >
                        {brand.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {brand.industry}
                      {brand.toneOfVoice ? ` · ${brand.toneOfVoice}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created {formatCreatedDate(brand.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
