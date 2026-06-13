import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
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
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <Card className="w-full max-w-md border-border/80 bg-card/75 shadow-sm [--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="font-heading text-3xl tracking-[-0.03em]">
            Sign in
          </CardTitle>
          <CardDescription className="text-base leading-7">
            Access your creative operations studio with Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignInButton />
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
