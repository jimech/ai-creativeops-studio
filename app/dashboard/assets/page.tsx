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

export default async function AssetsPage() {
  await requireCurrentUserId();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <Badge variant="outline" className="w-fit bg-background/60">
          Coming soon
        </Badge>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Brand assets
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Upload and organize logos, product imagery, and brand files for your
          campaigns. Asset management is on the roadmap for a future release.
        </p>
      </section>

      <Card className="border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Continue in the studio
          </CardTitle>
          <CardDescription className="text-base leading-7">
            While assets are in development, you can keep building campaigns with
            your saved brand profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild className="rounded-full">
            <Link href="/dashboard">Dashboard overview</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard/brands">Brand profiles</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard/campaigns">Campaign library</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-background/60">
            <Link href="/dashboard/billing">Billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
