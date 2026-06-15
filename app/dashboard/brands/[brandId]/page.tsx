import Link from "next/link";

import { BrandEditForm } from "@/components/forms/brand-edit-form";
import { Button } from "@/components/ui/button";
import { requireBrandOwner } from "@/lib/auth/authorization";

function formatCreatedDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    date,
  );
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;
  const brand = await requireBrandOwner(brandId);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <Button asChild variant="outline" className="mb-4 rounded-full bg-background/60">
          <Link href="/dashboard/brands">Back to brands</Link>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Brand profile
        </p>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          {brand.name}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          {brand.industry} · Created {formatCreatedDate(brand.createdAt)}
        </p>
      </section>

      <BrandEditForm brand={brand} />
    </div>
  );
}
