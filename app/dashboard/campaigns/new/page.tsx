import { CampaignGeneratorForm } from "@/components/forms/campaign-generator-form";

export default function NewCampaignPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Campaign generator
        </p>
        <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Create campaign
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Generate campaign concepts, captions, hooks, and visual direction from
          brand context. This screen is a static preview of the future generator
          workflow.
        </p>
      </section>

      <CampaignGeneratorForm />
    </div>
  );
}
