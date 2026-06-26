import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { GlassMosaicBackground } from "@/components/ui/glass-mosaic-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <AmbientBackground />
      <GlassMosaicBackground />
      <div className="glow-blob top-1/2 left-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 opacity-40" />

      <Card className="relative z-10 w-full max-w-md [--card-spacing:--spacing(6)]">
        <CardHeader>
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-heading text-2xl font-semibold tracking-tight">
              ai-creativeops-studio
            </span>
            <span className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-muted-foreground">
              AI creative operations
            </span>
          </Link>
          <CardTitle className="mt-4 font-heading text-3xl tracking-[-0.01em]">
            Sign in
          </CardTitle>
          <CardDescription className="text-base leading-6">
            Access your creative operations studio with Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignInButton />
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
