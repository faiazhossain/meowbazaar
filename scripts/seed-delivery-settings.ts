import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

async function main() {
  console.log("Seeding delivery settings...");

  for (const division of DIVISIONS) {
    const existing = await prisma.deliverySettings.findUnique({
      where: { division },
    });

    if (!existing) {
      await prisma.deliverySettings.create({
        data: {
          division,
          freeDeliveryThreshold: 500,
          standardDeliveryFee: 60,
          freeDeliveryType: "FREE",
          isActive: true,
        },
      });
      console.log(`Created delivery settings for ${division}`);
    } else {
      console.log(`Delivery settings already exist for ${division}`);
    }
  }

  console.log("Delivery settings seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding delivery settings:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
