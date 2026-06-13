import { auth } from "@/auth";
import { AuthorizationError } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db/prisma";

export async function ensureCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthorizationError();
  }

  return prisma.user.upsert({
    where: { id: session.user.id },
    create: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
    update: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });
}
