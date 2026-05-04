import { prisma } from "@/lib/prisma";

export async function recommendDish(
  flavorIds: number[],
  restrictionIds: number[],
  excludeId?: number
) {
  const dishes = await prisma.dish.findMany({
    where: {
      flavors: { some: { flavorId: { in: flavorIds } } },
      NOT: {
        avoidRestrictions: { some: { restrictionId: { in: restrictionIds } } },
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: {
      flavors: { include: { flavor: true } },
      avoidRestrictions: { include: { restriction: true } },
    },
  });

  if (dishes.length === 0) return null;
  const idx = Math.floor(Math.random() * dishes.length);
  return dishes[idx];
}
