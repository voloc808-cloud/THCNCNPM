import { PrismaClient, Role } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Thiếu biến môi trường DATABASE_URL");
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
const atTime = (hour: number, minute = 0) =>
  new Date(Date.UTC(1970, 0, 1, hour, minute));

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@royalbarber.vn" },
    update: { fullName: "Quản trị Royal Barber" },
    create: {
      email: "admin@royalbarber.vn",
      passwordHash,
      fullName: "Quản trị Royal Barber",
      phone: "0900000001",
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const staffInputs = [
    {
      email: "minh@royalbarber.vn",
      fullName: "Nguyễn Hoàng Minh",
      phone: "0900000002",
      bio: "Chuyên fade và phong cách cổ điển.",
      specialties: "Fade, Pompadour, Classic Cut",
      yearsOfExperience: 8,
    },
    {
      email: "khoa@royalbarber.vn",
      fullName: "Trần Anh Khoa",
      phone: "0900000003",
      bio: "Chuyên tạo kiểu hiện đại và chăm sóc râu.",
      specialties: "Modern Cut, Beard Styling",
      yearsOfExperience: 6,
    },
  ];

  const staffProfiles = [];
  for (const input of staffInputs) {
    const existingStaff = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { phone: input.phone }] },
    });
    const staff = existingStaff
      ? await prisma.user.update({
          where: { id: existingStaff.id },
          data: {
            email: input.email,
            fullName: input.fullName,
            phone: input.phone,
            role: Role.STAFF,
            staffProfile: {
              upsert: {
                update: {
                  bio: input.bio,
                  specialties: input.specialties,
                  yearsOfExperience: input.yearsOfExperience,
                },
                create: {
                  bio: input.bio,
                  specialties: input.specialties,
                  yearsOfExperience: input.yearsOfExperience,
                },
              },
            },
          },
          include: { staffProfile: true },
        })
      : await prisma.user.create({
          data: {
            email: input.email,
            passwordHash,
            fullName: input.fullName,
            phone: input.phone,
            role: Role.STAFF,
            emailVerifiedAt: new Date(),
            staffProfile: {
              create: {
                bio: input.bio,
                specialties: input.specialties,
                yearsOfExperience: input.yearsOfExperience,
              },
            },
          },
          include: { staffProfile: true },
        });
    if (!staff.staffProfile)
      throw new Error(`Tài khoản ${input.email} chưa có hồ sơ thợ`);
    staffProfiles.push(staff.staffProfile);
  }

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { fullName: "Khách hàng mẫu" },
    create: {
      email: "customer@example.com",
      passwordHash,
      fullName: "Khách hàng mẫu",
      phone: "0900000004",
      role: Role.CUSTOMER,
      emailVerifiedAt: new Date(),
      customerProfile: { create: {} },
    },
  });

  const serviceInputs = [
    {
      name: "Cắt tóc Classic",
      slug: "cat-toc-classic",
      description: "Tư vấn và cắt tạo kiểu phù hợp khuôn mặt.",
      price: 150000,
      durationMinutes: 45,
      sortOrder: 1,
    },
    {
      name: "Fade cao cấp",
      slug: "fade-cao-cap",
      description: "Kỹ thuật fade chuyển tầng sắc nét.",
      price: 200000,
      durationMinutes: 60,
      sortOrder: 2,
    },
    {
      name: "Cạo mặt & tạo hình râu",
      slug: "cao-mat-tao-hinh-rau",
      description: "Khăn nóng, cạo mặt và tạo hình râu chuyên nghiệp.",
      price: 120000,
      durationMinutes: 30,
      sortOrder: 3,
    },
    {
      name: "Gội đầu thư giãn",
      slug: "goi-dau-thu-gian",
      description: "Gội, massage đầu và sấy tạo kiểu.",
      price: 100000,
      durationMinutes: 30,
      sortOrder: 4,
    },
  ];

  const services = [];
  for (const service of serviceInputs) {
    services.push(
      await prisma.service.upsert({
        where: { slug: service.slug },
        update: service,
        create: service,
      }),
    );
  }

  for (const staff of staffProfiles) {
    await prisma.staffService.createMany({
      data: services.map((service) => ({
        staffId: staff.id,
        serviceId: service.id,
      })),
      skipDuplicates: true,
    });
    await prisma.staffShift.deleteMany({ where: { staffId: staff.id } });
    await prisma.staffShift.createMany({
      data: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        staffId: staff.id,
        dayOfWeek,
        startTime: atTime(9),
        endTime: atTime(19),
      })),
    });
  }

  console.log(
    "Đã seed dữ liệu. Mật khẩu chung cho tài khoản mẫu: Password@123",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
