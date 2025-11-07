// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 🧹 Cleanup (only for dev use)
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  // 👑 Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@newsprk.com",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // 👩‍💻 Authors
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
      {
        name: "Alex Johnson",
        bio: "Business and finance columnist, passionate about startups.",
        avatarUrl: "https://randomuser.me/api/portraits/men/78.jpg",
      },
    ],
  });
  console.log("✅ Created 3 authors");

  // 🏷️ Categories
  const categories = await prisma.category.createMany({
    data: [
      { name: "Trending", slug: "trending" },
      { name: "Technology", slug: "technology" },
      { name: "Business", slug: "business" },
      { name: "Sports", slug: "sports" },
      { name: "Entertainment", slug: "entertainment" },
      { name: "Videos", slug: "videos" },
      { name: "News", slug: "news" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Created 7 categories");

  // 🧭 Fetch references
  const authorList = await prisma.author.findMany();
  const categoryList = await prisma.category.findMany();

  // 📰 Sample content generator
  const sampleContent = `
    <p>Artificial Intelligence continues to evolve with breakthroughs in generative models, robotics, and real-time translation systems.</p>
    <p>From natural language processing to computer vision, the AI landscape is rapidly transforming industries worldwide.</p>
    <p>Experts predict a surge in ethical AI frameworks and advanced edge computing in 2025.</p>
  `;

  // 📸 Random images for variety
  const imageTopics = [
    "technology",
    "ai",
    "sports",
    "business",
    "entertainment",
    "news",
    "office",
    "media",
    "innovation",
  ];

  // 🧩 Create 5 posts per category
  let postCount = 0;
  for (const category of categoryList) {
    for (let i = 1; i <= 5; i++) {
      const randomAuthor =
        authorList[Math.floor(Math.random() * authorList.length)];
      const randomImage =
        imageTopics[Math.floor(Math.random() * imageTopics.length)];
      await prisma.post.create({
        data: {
          title: `${category.name} Insight ${i}`,
          slug: `${category.slug}-insight-${i}`,
          excerpt: `An overview of ${category.name.toLowerCase()} trends in 2025.`,
          content: sampleContent,
          imageUrl: `https://source.unsplash.com/800x400/?${randomImage}`,
          authorId: randomAuthor.id,
          categoryId: category.id,
          publishedAt: new Date(),
        },
      });
      postCount++;
    }
  }

  console.log(`✅ Created ${postCount} sample posts`);

  // 💬 Add random comments
  const allPosts = await prisma.post.findMany();
  for (const post of allPosts.slice(0, 10)) {
    await prisma.comment.createMany({
      data: [
        {
          postId: post.id,
          name: "Michael",
          email: "michael@example.com",
          content: "Fantastic read! Insightful perspective.",
        },
        {
          postId: post.id,
          name: "Sophie",
          email: "sophie@example.com",
          content: "I completely agree with this take!",
        },
      ],
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

export { main };
