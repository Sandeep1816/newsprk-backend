import { defineConfig, env } from "prisma/config";
import "dotenv/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});


// import { defineConfig, env } from "prisma/config";
// import "dotenv/config";

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   engine: "classic",
//   datasource: {
//     url: env("DATABASE_URL"),
//   },

//   // ✅ Prisma seed support (TypeScript doesn’t know about this yet)
// // @ts-ignore
// seed: {
//   run: async () => {
//     const { main } = await import("./prisma/seed.js");
//     await main();
//   },
// },

// });
