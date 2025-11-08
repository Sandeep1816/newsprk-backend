import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 🧹 Clear existing data
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 👨‍💼 Admin user
  const hashed = await bcrypt.hash("AdminPass123!", 10);
  await prisma.user.create({
    data: {
      email: "admin@newsprk.com",
      password: hashed,
      role: "admin",
    },
  });
  console.log("✅ Created admin: admin@newsprk.com");

  // 👩‍💻 Authors
  const authorsData = [
    {
      name: "John Doe",
      bio: "Tech journalist and editor at Newsprk.",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Jane Smith",
      bio: "Lifestyle writer covering travel, food, and fashion.",
      avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      name: "Alex Johnson",
      bio: "Business and finance columnist, passionate about startups.",
      avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg",
    },
  ];

  const authors = await Promise.all(authorsData.map(a => prisma.author.create({ data: a })));
  console.log(`✅ Created ${authors.length} authors`);

  // 🏷️ Categories
  const categoriesData = [
    { name: "Trending", slug: "trending" },
    { name: "Manufacturing", slug: "manufacturing" },
    { name: "Basics", slug: "basics" },
    { name: "Videos", slug: "videos" },
    { name: "News", slug: "news" },
    { name: "Products", slug: "products" },
  ];
  const categories = await Promise.all(categoriesData.map(c => prisma.category.create({ data: c })));
  console.log(`✅ Created ${categories.length} categories`);

  // Utility: Random helper
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomImage = (keyword) =>
    `https://source.unsplash.com/800x400/?${keyword},${Math.random().toString(36).slice(2, 8)}`;

  // 📰 Generate multiple posts for each category
  const now = new Date();
  const sampleContent = `
    <p>Artificial Intelligence continues to evolve with breakthroughs in generative models, robotics, and automation systems.</p>
    <p>From natural language processing to computer vision, the tech landscape is rapidly transforming industries worldwide.</p>
    <p>Experts predict massive adoption of AI-driven tools in 2025 and beyond.</p>
  `;

  const postsData = [];

  // Trending
  for (let i = 1; i <= 5; i++) {
    postsData.push({
      title: `Trending Insight ${i}`,
      slug: `trending-insight-${i}`,
      excerpt: "A look into the latest industry trends shaping 2025.",
      content: sampleContent,
      imageUrl: randomImage("trending"),
      authorId: randomItem(authors).id,
      categoryId: categories.find(c => c.slug === "trending").id,
      publishedAt: new Date(now.getTime() - i * 3600000),
    });
  }

  // Manufacturing
  for (let i = 1; i <= 6; i++) {
    postsData.push({
      title: `Manufacturing Insight ${i}`,
      slug: `manufacturing-insight-${i}`,
      excerpt: "Latest advancements in manufacturing technology and automation.",
      content: sampleContent,
      imageUrl: randomImage("manufacturing"),
      authorId: randomItem(authors).id,
      categoryId: categories.find(c => c.slug === "manufacturing").id,
      publishedAt: new Date(now.getTime() - i * 7200000),
    });
  }

  // Basics
  for (let i = 1; i <= 5; i++) {
    postsData.push({
      title: `Basics Insight ${i}`,
      slug: `basics-insight-${i}`,
      excerpt: "Fundamental learnings and core moldmaking practices.",
      content: sampleContent,
      imageUrl: randomImage("basics"),
      authorId: randomItem(authors).id,
      categoryId: categories.find(c => c.slug === "basics").id,
      publishedAt: new Date(now.getTime() - i * 5400000),
    });
  }

  // Videos
  for (let i = 1; i <= 5; i++) {
    postsData.push({
      title: `Videos Insight ${i}`,
      slug: `videos-insight-${i}`,
      excerpt: "Highlights and visual stories on moldmaking innovation.",
      content: sampleContent,
      imageUrl: randomImage("videos"),
      authorId: randomItem(authors).id,
      categoryId: categories.find(c => c.slug === "videos").id,
      publishedAt: new Date(now.getTime() - i * 6000000),
    });
  }

  // News
  for (let i = 1; i <= 7; i++) {
    postsData.push({
      title: `News Insight ${i}`,
      slug: `news-insight-${i}`,
      excerpt: "An overview of news trends in 2025.",
      content: sampleContent,
      imageUrl: randomImage("news"),
      authorId: randomItem(authors).id,
      categoryId: categories.find(c => c.slug === "news").id,
      publishedAt: new Date(now.getTime() - i * 3600000),
    });
  }

  // Products
  for (let i = 1; i <= 7; i++) {
    postsData.push({
      title: `Product Spotlight ${i}`,
      slug: `product-spotlight-${i}`,
      excerpt: "Exploring the latest innovations in moldmaking products.",
      content: sampleContent,
      imageUrl: randomImage("products"),
      authorId: randomItem(authors).id,
      categoryId: categories.find(c => c.slug === "products").id,
      publishedAt: new Date(now.getTime() - i * 4800000),
    });
  }

  await prisma.post.createMany({ data: postsData });
  console.log(`✅ Created ${postsData.length} sample posts`);

  // 💬 Example comments
  const posts = await prisma.post.findMany({ take: 3 });
  for (const post of posts) {
    await prisma.comment.create({
      data: {
        postId: post.id,
        name: "Demo User",
        email: "demo@example.com",
        content: "This is a sample comment for testing UI.",
      },
    });
  }
  console.log("✅ Added example comments");

  console.log("🌿 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
