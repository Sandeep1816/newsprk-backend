// // prisma/seed-admin.js
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";
// const prisma = new PrismaClient();

// async function main() {
//   const email = "admin@toolingtrends.com";
//   const password = "Admin@21";
//   const hashed = await bcrypt.hash(password, 10);

//   const existing = await prisma.user.findUnique({ where: { email } });
//   if (!existing) {
//     await prisma.user.create({
//       data: { email, password: hashed, role: "admin" },
//     });
//     console.log("Created admin user:", email, "password:", password);
//   } else {
//     console.log("Admin already exists:", email);
//   }
// }

// main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());


// prisma/seed-admin.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@toolingtrends.com";
  const password = "Admin@21";
  const username = "admin";   // ✅ REQUIRED
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: "admin",
        username,           // ✅ REQUIRED
        emailVerified: true // optional but recommended
      },
    });

    console.log("✅ Created admin user");
    console.log("Email:", email);
    console.log("Password:", password);
  } else {
    console.log("⚠️ Admin already exists:", email);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
