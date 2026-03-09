import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@meowbazaar.com" },
    update: {},
    create: {
      email: "admin@meowbazaar.com",
      name: "Admin",
      password: adminPassword,
      phone: "+8801700000000",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create test customer
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "মোঃ আব্দুল্লাহ",
      password: customerPassword,
      phone: "+8801712345678",
      role: "CUSTOMER",
      cart: {
        create: {},
      },
    },
  });
  console.log("✅ Customer user created:", customer.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "food" },
      update: {},
      create: {
        name: "ক্যাট ফুড",
        nameEn: "Cat Food",
        slug: "food",
        image:
          "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "toys" },
      update: {},
      create: {
        name: "খেলনা",
        nameEn: "Toys",
        slug: "toys",
        image:
          "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "litter" },
      update: {},
      create: {
        name: "লিটার",
        nameEn: "Litter",
        slug: "litter",
        image:
          "https://images.unsplash.com/photo-1603380353725-f8a4d39cc41e?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "accessories" },
      update: {},
      create: {
        name: "এক্সেসরিজ",
        nameEn: "Accessories",
        slug: "accessories",
        image:
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "health" },
      update: {},
      create: {
        name: "স্বাস্থ্য",
        nameEn: "Health",
        slug: "health",
        image:
          "https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "grooming" },
      update: {},
      create: {
        name: "গ্রুমিং",
        nameEn: "Grooming",
        slug: "grooming",
        image:
          "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&h=200&fit=crop",
      },
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // Create products
  const products = [
    {
      name: "রয়্যাল ক্যানিন ইনডোর ক্যাট ফুড ২কেজি",
      nameEn: "Royal Canin Indoor Cat Food 2kg",
      slug: "royal-canin-indoor-cat-food-2kg",
      description:
        "ইনডোর বিড়ালদের জন্য বিশেষভাবে তৈরি প্রিমিয়াম ক্যাট ফুড। পুষ্টিকর এবং সুস্বাদু।",
      price: 2450,
      mrp: 2800,
      image:
        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop",
      categorySlug: "food",
      stock: 25,
      rating: 4.8,
      reviewCount: 124,
    },
    {
      name: "ফেদার ওয়ান্ড ক্যাট টয় ইন্টারেক্টিভ",
      nameEn: "Feather Wand Cat Toy Interactive",
      slug: "feather-wand-cat-toy-interactive",
      description:
        "আপনার বিড়ালকে খেলতে উৎসাহিত করার জন্য ইন্টারেক্টিভ ফেদার ওয়ান্ড টয়।",
      price: 350,
      mrp: 450,
      image:
        "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop",
      categorySlug: "toys",
      stock: 5,
      rating: 4.5,
      reviewCount: 89,
      isNew: true,
    },
    {
      name: "ক্যাট লিটার ক্লাম্পিং ১০লিটার",
      nameEn: "Cat Litter Clumping 10L",
      slug: "cat-litter-clumping-10l",
      description:
        "দুর্গন্ধ নিয়ন্ত্রণকারী ক্লাম্পিং ক্যাট লিটার। সহজে পরিষ্কার করা যায়।",
      price: 850,
      mrp: 1000,
      image:
        "https://images.unsplash.com/photo-1603380353725-f8a4d39cc41e?w=400&h=400&fit=crop",
      categorySlug: "litter",
      stock: 2,
      rating: 4.6,
      reviewCount: 256,
    },
    {
      name: "সফট ক্যাট বেড প্লাশ রাউন্ড",
      nameEn: "Soft Cat Bed Plush Round",
      slug: "soft-cat-bed-plush-round",
      description:
        "আরামদায়ক প্লাশ রাউন্ড ক্যাট বেড। আপনার বিড়ালের আরামদায়ক ঘুমের জন্য।",
      price: 1200,
      mrp: 1500,
      image:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 15,
      rating: 4.9,
      reviewCount: 78,
    },
    {
      name: "হুইসকাস ওয়েট ক্যাট ফুড টুনা ৮৫গ্রাম",
      nameEn: "Whiskas Wet Cat Food Tuna 85g",
      slug: "whiskas-wet-cat-food-tuna-85g",
      description: "টুনা ফ্লেভারের মুখরোচক ওয়েট ক্যাট ফুড।",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&h=400&fit=crop",
      categorySlug: "food",
      stock: 100,
      rating: 4.4,
      reviewCount: 312,
      isNew: true,
    },
    {
      name: "অটোমেটিক লেজার ক্যাট টয়",
      nameEn: "Automatic Laser Cat Toy",
      slug: "automatic-laser-cat-toy",
      description:
        "স্বয়ংক্রিয় লেজার টয় যা আপনার বিড়ালকে ঘন্টার পর ঘন্টা ব্যস্ত রাখবে।",
      price: 780,
      mrp: 950,
      image:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop",
      categorySlug: "toys",
      stock: 8,
      rating: 4.3,
      reviewCount: 45,
      isNew: true,
    },
    {
      name: "ক্যাট স্ক্র্যাচিং পোস্ট ৭০সেমি",
      nameEn: "Cat Scratching Post 70cm",
      slug: "cat-scratching-post-70cm",
      description: "মজবুত স্ক্র্যাচিং পোস্ট যা আপনার ফার্নিচার রক্ষা করবে।",
      price: 1650,
      mrp: 2000,
      image:
        "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 12,
      rating: 4.7,
      reviewCount: 167,
      isNew: true,
    },
    {
      name: "ক্যাট গ্রুমিং ব্রাশ সেলফ ক্লিনিং",
      nameEn: "Cat Grooming Brush Self Cleaning",
      slug: "cat-grooming-brush-self-cleaning",
      description: "সেলফ ক্লিনিং গ্রুমিং ব্রাশ। সহজে পরিষ্কার করা যায়।",
      price: 450,
      mrp: 550,
      image:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=400&fit=crop",
      categorySlug: "grooming",
      stock: 20,
      rating: 4.6,
      reviewCount: 93,
      isNew: true,
    },
    {
      name: "মিও ক্যাট ফুড চিকেন ফ্লেভার ১.২কেজি",
      nameEn: "Me-O Cat Food Chicken Flavor 1.2kg",
      slug: "me-o-cat-food-chicken-1-2kg",
      description: "চিকেন ফ্লেভারের সুস্বাদু ড্রাই ক্যাট ফুড।",
      price: 680,
      mrp: 750,
      image:
        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop",
      categorySlug: "food",
      stock: 30,
      rating: 4.2,
      reviewCount: 189,
    },
    {
      name: "ক্যাট ক্যারিয়ার ব্যাগ এয়ারলাইন অ্যাপ্রুভড",
      nameEn: "Cat Carrier Bag Airline Approved",
      slug: "cat-carrier-bag-airline-approved",
      description:
        "এয়ারলাইন অ্যাপ্রুভড ক্যাট ক্যারিয়ার ব্যাগ। ভ্রমণের জন্য উপযুক্ত।",
      price: 1850,
      mrp: 2200,
      image:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 7,
      rating: 4.8,
      reviewCount: 56,
    },
    {
      name: "ক্যাট নিপ স্প্রে ১০০মিলি",
      nameEn: "Cat Nip Spray 100ml",
      slug: "cat-nip-spray-100ml",
      description:
        "ন্যাচারাল ক্যাট নিপ স্প্রে। খেলনা এবং স্ক্র্যাচিং পোস্টে স্প্রে করুন।",
      price: 320,
      image:
        "https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?w=400&h=400&fit=crop",
      categorySlug: "toys",
      stock: 40,
      rating: 4.1,
      reviewCount: 67,
    },
    {
      name: "ক্যাট ফিডার বাউল স্টেইনলেস স্টিল",
      nameEn: "Cat Feeder Bowl Stainless Steel",
      slug: "cat-feeder-bowl-stainless-steel",
      description: "স্টেইনলেস স্টিল ফিডার বাউল। সহজে পরিষ্কার এবং টেকসই।",
      price: 280,
      mrp: 350,
      image:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 50,
      rating: 4.5,
      reviewCount: 142,
    },
  ];

  for (const product of products) {
    const category = categories.find((c) => c.slug === product.categorySlug);
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        nameEn: product.nameEn,
        slug: product.slug,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        categoryId: category.id,
        stock: product.stock,
        inStock: product.stock > 0,
        isNew: product.isNew ?? false,
        hasCOD: true,
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
    });
  }
  console.log("✅ Products created:", products.length);

  // Create address for test customer
  await prisma.address.upsert({
    where: { id: "default-address" },
    update: {},
    create: {
      id: "default-address",
      userId: customer.id,
      fullName: "মোঃ আব্দুল্লাহ",
      phone: "+8801712345678",
      division: "ঢাকা",
      area: "ধানমন্ডি",
      address: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা ১২০৫",
      isDefault: true,
    },
  });
  console.log("✅ Default address created");

  console.log("🎉 Database seeded successfully!");
  console.log("");
  console.log("📧 Admin login: admin@meowbazaar.com / admin123");
  console.log("📧 Customer login: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
