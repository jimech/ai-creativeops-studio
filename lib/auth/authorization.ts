/**
 * Server-side ownership authorization helpers.
 *
 * Use these in Server Components, Server Actions, and API route handlers to
 * confirm the authenticated user may access a record before reads or writes.
 * Optional helpers return null when unauthenticated or unauthorized; require
 * helpers throw or call notFound() without revealing whether another user's
 * resource exists.
 */

import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export class AuthorizationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new AuthorizationError();
  }

  return userId;
}

export async function requireCurrentUser() {
  const userId = await requireCurrentUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AuthorizationError();
  }

  return user;
}

export async function isBrandOwner(brandId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
    select: { id: true },
  });

  return brand !== null;
}

export async function requireBrandOwner(brandId: string) {
  const userId = await requireCurrentUserId();
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
  });

  if (!brand) {
    notFound();
  }

  return brand;
}

export async function getBrandForCurrentUser(brandId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.brand.findFirst({
    where: { id: brandId, ownerId: userId },
  });
}

export async function getCampaignForCurrentUser(campaignId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.campaign.findFirst({
    where: {
      id: campaignId,
      brand: { ownerId: userId },
    },
  });
}

export async function requireCampaignOwner(campaignId: string) {
  const userId = await requireCurrentUserId();
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      brand: { ownerId: userId },
    },
  });

  if (!campaign) {
    notFound();
  }

  return campaign;
}

export async function getAssetForCurrentUser(assetId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.asset.findFirst({
    where: {
      id: assetId,
      brand: { ownerId: userId },
    },
  });
}

export async function requireAssetOwner(assetId: string) {
  const userId = await requireCurrentUserId();
  const asset = await prisma.asset.findFirst({
    where: {
      id: assetId,
      brand: { ownerId: userId },
    },
  });

  if (!asset) {
    notFound();
  }

  return asset;
}

export async function getSubscriptionForCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.subscription.findUnique({
    where: { userId },
  });
}

export async function requireSubscriptionForCurrentUser() {
  const userId = await requireCurrentUserId();
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    notFound();
  }

  return subscription;
}

export async function getAiUsageForCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return prisma.aiUsage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function requireAiUsageOwner(aiUsageId: string) {
  const userId = await requireCurrentUserId();
  const aiUsage = await prisma.aiUsage.findFirst({
    where: {
      id: aiUsageId,
      userId,
    },
  });

  if (!aiUsage) {
    notFound();
  }

  return aiUsage;
}
