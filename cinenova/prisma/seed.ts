import { PrismaClient, ProductKind, GameCode, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@cinenova.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "CineNova Admin",
      passwordHash,
      role: UserRole.SUPERADMIN,
    },
  });

  // categories
  const gameCat = await prisma.category.upsert({
    where: { slug: "game-topup" },
    update: {},
    create: { slug: "game-topup", name: "Game Top-Ups", kind: ProductKind.GAME_TOPUP, position: 1 },
  });
  const smmCat = await prisma.category.upsert({
    where: { slug: "smm" },
    update: {},
    create: { slug: "smm", name: "SMM Services", kind: ProductKind.SMM_SERVICE, position: 2 },
  });
  await prisma.category.upsert({
    where: { slug: "subscriptions" },
    update: {},
    create: { slug: "subscriptions", name: "Subscriptions", kind: ProductKind.SUBSCRIPTION, position: 3 },
  });

  // a couple game topup products
  const games: Array<{ code: GameCode; name: string; topup: string; cost: number; sell: number }> = [
    { code: GameCode.FREE_FIRE, name: "Free Fire 100 Diamonds", topup: "100 Diamonds", cost: 110, sell: 145 },
    { code: GameCode.FREE_FIRE, name: "Free Fire 310 Diamonds", topup: "310 Diamonds", cost: 330, sell: 425 },
    { code: GameCode.PUBG, name: "PUBG 60 UC", topup: "60 UC", cost: 130, sell: 175 },
    { code: GameCode.MOBILE_LEGENDS, name: "ML 86 Diamonds", topup: "86 Diamonds", cost: 180, sell: 235 },
  ];
  for (const g of games) {
    const sku = `${g.code}-${g.topup.replace(/\s+/g, "-").toUpperCase()}`;
    await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        sku,
        kind: ProductKind.GAME_TOPUP,
        categoryId: gameCat.id,
        name: g.name,
        gameCode: g.code,
        topupAmount: g.topup,
        costPrice: g.cost,
        sellPrice: g.sell,
      },
    });
  }

  // demo SMM provider (inactive by default — admin enables)
  await prisma.smmProvider.upsert({
    where: { id: "demo-provider" },
    update: {},
    create: {
      id: "demo-provider",
      name: "Demo SMM Panel",
      apiUrl: "https://example-smm-panel.test/api/v2",
      apiKey: "REPLACE_ME",
      isActive: false,
    },
  });

  console.log("Seed complete. Admin login:", email);
  console.log("Admin password:", password);
  console.log("User id:", admin.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
