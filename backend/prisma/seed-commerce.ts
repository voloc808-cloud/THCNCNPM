import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client.js";

const value = process.env.DATABASE_URL;
if (!value) throw new Error("Thiếu DATABASE_URL");
const url = new URL(value);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname === "localhost" ? "127.0.0.1" : url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  }),
});

async function main() {
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { slug: "tao-kieu" },
      update: {},
      create: { name: "Tạo kiểu", slug: "tao-kieu", sortOrder: 1 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "cham-soc-toc" },
      update: {},
      create: { name: "Chăm sóc tóc", slug: "cham-soc-toc", sortOrder: 2 },
    }),
    prisma.productCategory.upsert({
      where: { slug: "cham-soc-rau" },
      update: {},
      create: { name: "Chăm sóc râu", slug: "cham-soc-rau", sortOrder: 3 },
    }),
  ]);
  const bySlug = Object.fromEntries(
    categories.map((item) => [item.slug, item.id]),
  );
  const products = [
    {
      categoryId: bySlug["tao-kieu"],
      name: "Royal Matte Pomade",
      slug: "royal-matte-pomade",
      sku: "RB-POM-01",
      description:
        "Pomade gốc nước với độ giữ nếp cao, hoàn thiện lì tự nhiên và dễ dàng gội sạch.",
      price: 280000,
      stock: 30,
      sortOrder: 1,
    },
    {
      categoryId: bySlug["tao-kieu"],
      name: "Sea Salt Texture Spray",
      slug: "sea-salt-texture-spray",
      sku: "RB-SEA-01",
      description:
        "Xịt tạo phồng và kết cấu nhẹ, phù hợp các kiểu tóc tự nhiên hiện đại.",
      price: 240000,
      stock: 24,
      sortOrder: 2,
    },
    {
      categoryId: bySlug["cham-soc-toc"],
      name: "Daily Balance Shampoo",
      slug: "daily-balance-shampoo",
      sku: "RB-SHA-01",
      description:
        "Dầu gội làm sạch dịu nhẹ, cân bằng da đầu và giữ tóc khỏe mỗi ngày.",
      price: 220000,
      stock: 18,
      sortOrder: 3,
    },
    {
      categoryId: bySlug["cham-soc-rau"],
      name: "Royal Beard Oil",
      slug: "royal-beard-oil",
      sku: "RB-BEA-01",
      description:
        "Dầu dưỡng giúp râu mềm mượt, giảm khô ngứa và nuôi dưỡng vùng da bên dưới.",
      price: 260000,
      stock: 20,
      sortOrder: 4,
    },
  ];
  for (const product of products)
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  console.log(
    `Đã seed ${categories.length} danh mục và ${products.length} sản phẩm.`,
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
