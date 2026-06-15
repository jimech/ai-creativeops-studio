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
import { prisma } from "@/lib/db/prisma";

function formatCreatedDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    date,
  );
}

function truncatePreview(text: string, maxLength = 120): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

export default async function BrandsPage() {
  const userId = await requireCurrentUserId();

  const brands = await prisma.brand.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      industry: true,
      toneOfVoice: true,
      targetAudience: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Brand profiles
          </p>
          <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Your brands
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
            Manage brand context used for campaign generation. Update voice,
            audience, and visual notes as your brand evolves.
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-full">
          <Link href="/dashboard/brands/new">New brand</Link>
        </Button>
      </section>

      {brands.length === 0 ? (
        <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CardTitle className="font-heading text-2xl">
              No brand profiles yet
            </CardTitle>
            <CardDescription className="mt-3 max-w-md text-base leading-7">
              Create your first brand profile to power campaign generation with
              tone, audience, and visual context.
            </CardDescription>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/dashboard/brands/new">Create brand profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {brands.map((brand) => (
            <Card
              key={brand.id}
              className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(5)]"
            >
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-heading text-xl font-semibold">
                      <Link
                        href={`/dashboard/brands/${brand.id}`}
                        className="hover:underline"
                      >
                        {brand.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {brand.industry}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit bg-background/60">
                    {formatCreatedDate(brand.createdAt)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Tone of voice
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {brand.toneOfVoice ?? "Not set"}
                  </p>
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Target audience
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {brand.targetAudience
                      ? truncatePreview(brand.targetAudience)
                      : "Not set"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
