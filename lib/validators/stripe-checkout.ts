import { z } from "zod";

export const stripeCheckoutPlanSchema = z.object({
  plan: z.enum(["PRO", "AGENCY"], {
    error: "Plan must be PRO or AGENCY.",
  }),
});

export type StripeCheckoutPlanRequest = z.infer<
  typeof stripeCheckoutPlanSchema
>;
