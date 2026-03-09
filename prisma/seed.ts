import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@petbazaar.com" },
    update: {},
    create: {
      email: "admin@petbazaar.com",
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
      where: { slug: "cat-food" },
      update: {},
      create: {
        name: "বিড়ালের খাবার",
        nameEn: "Cat Food",
        slug: "cat-food",
        image:
          "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "dog-food" },
      update: {},
      create: {
        name: "কুকুরের খাবার",
        nameEn: "Dog Food",
        slug: "dog-food",
        image:
          "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "bird-food" },
      update: {},
      create: {
        name: "পাখির খাবার",
        nameEn: "Bird Food",
        slug: "bird-food",
        image:
          "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=200&h=200&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "fish-food" },
      update: {},
      create: {
        name: "মাছের খাবার",
        nameEn: "Fish Food",
        slug: "fish-food",
        image:
          "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=200&h=200&fit=crop",
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
    prisma.category.upsert({
      where: { slug: "housing" },
      update: {},
      create: {
        name: "ঘর ও খাঁচা",
        nameEn: "Housing & Cages",
        slug: "housing",
        image:
          "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=200&h=200&fit=crop",
      },
    }),
  ]);
  console.log("✅ Categories created:", categories.length);

  // Create products
  const products = [
    // Cat Products
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
      categorySlug: "cat-food",
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
    // Dog Products
    {
      name: "পেডিগ্রি অ্যাডাল্ট ডগ ফুড ৩কেজি",
      nameEn: "Pedigree Adult Dog Food 3kg",
      slug: "pedigree-adult-dog-food-3kg",
      description: "অ্যাডাল্ট কুকুরের জন্য সম্পূর্ণ পুষ্টিকর ড্রাই ডগ ফুড।",
      price: 1850,
      mrp: 2100,
      image:
        "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=400&fit=crop",
      categorySlug: "dog-food",
      stock: 30,
      rating: 4.7,
      reviewCount: 189,
    },
    {
      name: "ডগ চিউ টয় রাবার বল",
      nameEn: "Dog Chew Toy Rubber Ball",
      slug: "dog-chew-toy-rubber-ball",
      description: "টেকসই রাবার বল যা কুকুরের দাঁতের জন্য ভালো।",
      price: 280,
      mrp: 350,
      image:
        "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop",
      categorySlug: "toys",
      stock: 45,
      rating: 4.4,
      reviewCount: 156,
    },
    {
      name: "ডগ কলার অ্যাডজাস্টেবল নাইলন",
      nameEn: "Dog Collar Adjustable Nylon",
      slug: "dog-collar-adjustable-nylon",
      description: "আরামদায়ক এবং টেকসই নাইলন কলার।",
      price: 320,
      mrp: 400,
      image:
        "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 60,
      rating: 4.4,
      reviewCount: 112,
      isNew: true,
    },
    {
      name: "ডগ শ্যাম্পু অ্যান্টি-ফ্লি ৫০০মিলি",
      nameEn: "Dog Shampoo Anti-Flea 500ml",
      slug: "dog-shampoo-anti-flea-500ml",
      description: "ফ্লি এবং টিক প্রতিরোধক শ্যাম্পু।",
      price: 380,
      mrp: 450,
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
      categorySlug: "grooming",
      stock: 35,
      rating: 4.5,
      reviewCount: 167,
    },
    // Bird Products
    {
      name: "বার্ড ফুড মিক্স সিড ১কেজি",
      nameEn: "Bird Food Mix Seed 1kg",
      slug: "bird-food-mix-seed-1kg",
      description: "বিভিন্ন পাখির জন্য মিশ্র বীজ খাবার।",
      price: 450,
      mrp: 550,
      image:
        "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=400&h=400&fit=crop",
      categorySlug: "bird-food",
      stock: 40,
      rating: 4.6,
      reviewCount: 78,
    },
    {
      name: "পাখির খাঁচা বড় সাইজ",
      nameEn: "Bird Cage Large Size",
      slug: "bird-cage-large-size",
      description: "বড় পাখিদের জন্য প্রশস্ত খাঁচা।",
      price: 2200,
      mrp: 2800,
      image:
        "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=400&h=400&fit=crop",
      categorySlug: "housing",
      stock: 15,
      rating: 4.7,
      reviewCount: 67,
      isNew: true,
    },
    {
      name: "পাখির জন্য ভিটামিন ড্রপস",
      nameEn: "Bird Vitamin Drops",
      slug: "bird-vitamin-drops",
      description: "পাখির স্বাস্থ্যের জন্য ভিটামিন ড্রপস।",
      price: 280,
      image:
        "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=400&h=400&fit=crop",
      categorySlug: "health",
      stock: 50,
      rating: 4.4,
      reviewCount: 56,
    },
    // Fish Products
    {
      name: "একোয়ারিয়াম ফিশ ফুড ১০০গ্রাম",
      nameEn: "Aquarium Fish Food 100g",
      slug: "aquarium-fish-food-100g",
      description: "একোয়ারিয়াম মাছের জন্য ভাসমান খাবার।",
      price: 180,
      image:
        "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=400&h=400&fit=crop",
      categorySlug: "fish-food",
      stock: 80,
      rating: 4.5,
      reviewCount: 234,
    },
    {
      name: "একোয়ারিয়াম ফিল্টার পাম্প",
      nameEn: "Aquarium Filter Pump",
      slug: "aquarium-filter-pump",
      description: "পানি পরিষ্কার রাখার জন্য ফিল্টার পাম্প।",
      price: 850,
      mrp: 1000,
      image:
        "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 25,
      rating: 4.5,
      reviewCount: 89,
      isNew: true,
    },
    {
      name: "ফিশ ট্যাঙ্ক ডেকোরেশন সেট",
      nameEn: "Fish Tank Decoration Set",
      slug: "fish-tank-decoration-set",
      description: "একোয়ারিয়াম সাজানোর জন্য ডেকোরেশন সেট।",
      price: 550,
      mrp: 700,
      image:
        "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 30,
      rating: 4.6,
      reviewCount: 78,
    },
    // Small Pets
    {
      name: "খরগোশের খাবার পেলেট ১কেজি",
      nameEn: "Rabbit Food Pellet 1kg",
      slug: "rabbit-food-pellet-1kg",
      description: "খরগোশের জন্য পুষ্টিকর পেলেট খাবার।",
      price: 380,
      mrp: 450,
      image:
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop",
      categorySlug: "accessories",
      stock: 35,
      rating: 4.6,
      reviewCount: 45,
      isNew: true,
    },
    {
      name: "হ্যামস্টার হুইল রানার",
      nameEn: "Hamster Wheel Runner",
      slug: "hamster-wheel-runner",
      description: "হ্যামস্টারের ব্যায়ামের জন্য হুইল রানার।",
      price: 450,
      mrp: 550,
      image:
        "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop",
      categorySlug: "toys",
      stock: 20,
      rating: 4.3,
      reviewCount: 34,
      isNew: true,
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
  console.log("📧 Admin login: admin@petbazaar.com / admin123");
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
