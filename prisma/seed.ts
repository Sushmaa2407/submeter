// ============================================================
// Seed script — run with `npm run db:seed`.
// Fills a fresh database with demo data so the README's
// "demo@demo.com" login actually has something to show.
// ============================================================
import { PrismaClient, Role, BillingInterval } from "@prisma/client";
import { hash } from "@node-rs/argon2"; // swap for your chosen argon2 lib

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hash("demo1234");
  const customerPasswordHash = await hash("demo1234");

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "demo@demo.com" },
    update: {},
    create: {
      email: "demo@demo.com",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      emailVerifiedAt: new Date(),
    },
  });

  const basicPlan = await prisma.plan.create({
    data: {
      name: "Basic",
      priceCents: 1000,
      billingInterval: BillingInterval.MONTHLY,
      usageLimit: 1000,
    },
  });

  await prisma.plan.create({
    data: {
      name: "Pro",
      priceCents: 3000,
      billingInterval: BillingInterval.MONTHLY,
      usageLimit: 10000,
    },
  });

  await prisma.plan.create({
    data: {
      name: "Enterprise",
      priceCents: 25000,
      billingInterval: BillingInterval.YEARLY,
      usageLimit: null, // unlimited
    },
  });

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      userId: customer.id,
      planId: basicPlan.id,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  console.log("Seeded:", { admin: admin.email, customer: customer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
