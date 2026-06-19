import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { SubscriptionPlan } from "@/lib/db/generated/prisma/client";

const navigation = [
  { label: "Overview", href: "/dashboard" },
  { label: "Brands", href: "/dashboard/brands" },
  { label: "Campaigns", href: "/dashboard/campaigns" },
  { label: "Assets", href: "/dashboard/assets" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Settings", href: "/dashboard/settings" },
];

export type DashboardShellUser = {
  displayName: string;
  email: string | null;
  image: string | null;
  initials: string;
};

export type DashboardShellPlan = {
  plan: SubscriptionPlan;
  planLabel: string;
  statusLabel: string;
};

export function DashboardShell({
  children,
  user,
  plan,
}: {
  children: ReactNode;
  user: DashboardShellUser;
  plan: DashboardShellPlan;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-border/80 bg-card/65 lg:flex lg:min-h-screen lg:flex-col">
        <div className="flex flex-col gap-1 px-6 py-6">
          <Link href="/dashboard" className="font-heading text-xl font-semibold">
            ai-creativeops-studio
          </Link>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-muted-foreground">
            Creative operations
          </p>
        </div>

        <Separator />

        <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground data-[active=true]:bg-secondary data-[active=true]:text-foreground"
              data-active={item.href === "/dashboard"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <div className="rounded-3xl border border-border/80 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Current plan
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-heading text-lg font-semibold">
                {plan.planLabel}
              </span>
              <Badge variant="secondary">{plan.statusLabel}</Badge>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-b border-border/80 bg-background/85 px-5 py-4 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <Link
                href="/dashboard"
                className="font-heading text-lg font-semibold leading-none"
              >
                ai-creativeops-studio
              </Link>
              <Badge variant="secondary">{plan.planLabel}</Badge>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-border/80 bg-card/70 px-4 py-2 text-sm text-muted-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  data-active={item.href === "/dashboard"}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Dashboard
                </p>
                <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Creative operations overview
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Manage brand context, campaign output, and editorial planning
                  from one calm studio workspace.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  aria-label="Search dashboard"
                  className="h-10 rounded-full bg-card/70 sm:w-64"
                  placeholder="Search campaigns, brands..."
                  type="search"
                />
                <div className="flex items-center justify-between gap-3 rounded-full border border-border/80 bg-card/70 px-3 py-2">
                  <Avatar size="sm">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.displayName} />
                    ) : null}
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pr-2 text-sm">
                    <p className="font-medium leading-none">{user.displayName}</p>
                    {user.email ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <SignOutButton />
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/campaigns/new">New campaign</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
