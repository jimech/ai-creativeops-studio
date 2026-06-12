import { BrandOnboardingForm } from "@/components/forms/brand-onboarding-form";

export default function NewBrandPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Brand onboarding
        </p>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Create brand profile
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Add the context ai-creativeops-studio needs to generate stronger
          campaign concepts, captions, hooks, and visual direction for your
          brand.
        </p>
      </section>

      <BrandOnboardingForm />
    </div>
  );
}
