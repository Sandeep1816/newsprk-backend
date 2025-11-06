import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 🧹 Clear existing data (optional)
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();

  // 👩‍💻 Create authors
  const authors = await prisma.author.createMany({
    data: [
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
    ],
  });

  console.log(`✅ Created ${authors.count} authors`);

  // 🏷️ Create categories
  const categories = await prisma.category.createMany({
    data: [
      { name: "Technology", slug: "technology" },
      { name: "Business", slug: "business" },
      { name: "Entertainment", slug: "entertainment" },
      { name: "Sports", slug: "sports" },
    ],
  });

  console.log(`✅ Created ${categories.count} categories`);

  // 📰 Create posts
  const author1 = await prisma.author.findFirst({ where: { name: "John Doe" } });
  const author2 = await prisma.author.findFirst({ where: { name: "Jane Smith" } });

  const techCategory = await prisma.category.findFirst({ where: { slug: "technology" } });
  const businessCategory = await prisma.category.findFirst({ where: { slug: "business" } });

  await prisma.post.createMany({
    data: [
      {
        title: "AI Revolution in 2025",
        slug: "ai-revolution-2025",
        excerpt: "The year 2025 marks the next wave of artificial intelligence advancements.",
        content:
          "Artificial Intelligence continues to evolve with breakthroughs in generative models, robotics, and real-time translation systems.",
        imageUrl: "https://source.unsplash.com/800x400/?technology,ai",
        authorId: author1.id,
        categoryId: techCategory.id,
        publishedAt: new Date(),
      },
      {
        title: "The Rise of Remote Work Culture",
        slug: "rise-of-remote-work",
        excerpt: "How global companies are adapting to a hybrid workforce model.",
        content:
          "The shift to remote work has changed how we collaborate, hire, and measure productivity. Here's how businesses are evolving.",
        imageUrl: "https://source.unsplash.com/800x400/?office,remote-work",
        authorId: author2.id,
        categoryId: businessCategory.id,
        publishedAt: new Date(),
      },
    ],
  });

  console.log("✅ Created sample posts");

  // 💬 Create comments
  const post1 = await prisma.post.findFirst({ where: { slug: "ai-revolution-2025" } });
  const post2 = await prisma.post.findFirst({ where: { slug: "rise-of-remote-work" } });

  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        name: "Michael",
        email: "michael@example.com",
        content: "Great insights! Excited about the AI future.",
      },
      {
        postId: post2.id,
        name: "Sophie",
        email: "sophie@example.com",
        content: "Remote work has truly changed my life for the better.",
      },
    ],
  });

  console.log("✅ Added example comments");
  console.log("🌿 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
