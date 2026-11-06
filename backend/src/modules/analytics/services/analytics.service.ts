import {
  AppointmentStatus,
  OrderStatus,
  Role,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../../config/prisma.js";
const range = (input: { dateFrom?: Date; dateTo?: Date }) => {
  const to = input.dateTo ?? new Date();
  const from = input.dateFrom ?? new Date(to.getTime() - 29 * 86400000);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};
const key = (d: Date) => d.toISOString().slice(0, 10);
const num = (v: unknown) => Number(v ?? 0);
export const analyticsService = {
  async summary(input: { dateFrom?: Date; dateTo?: Date }) {
    const { from, to } = range(input);
    const dateWhere = { gte: from, lte: to };
    const [
      appointments,
      orders,
      statusGroups,
      newCustomers,
      lowStock,
      serviceGroups,
      productGroups,
      staffGroups,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: { status: AppointmentStatus.COMPLETED, startAt: dateWhere },
        select: { id: true, startAt: true, totalPrice: true },
      }),
      prisma.order.findMany({
        where: { status: OrderStatus.COMPLETED, createdAt: dateWhere },
        select: { id: true, createdAt: true, total: true },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { startAt: dateWhere },
        _count: { _all: true },
      }),
      prisma.user.count({
        where: { role: Role.CUSTOMER, createdAt: dateWhere },
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 5 } },
        select: { id: true, name: true, sku: true, stock: true },
        orderBy: { stock: "asc" },
      }),
      prisma.appointmentService.groupBy({
        by: ["serviceId", "serviceName"],
        where: {
          appointment: {
            status: AppointmentStatus.COMPLETED,
            startAt: dateWhere,
          },
        },
        _count: { _all: true },
        _sum: { price: true },
        orderBy: { _count: { serviceId: "desc" } },
        take: 5,
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        where: {
          order: { status: OrderStatus.COMPLETED, createdAt: dateWhere },
        },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.appointment.groupBy({
        by: ["staffId"],
        where: { status: AppointmentStatus.COMPLETED, startAt: dateWhere },
        _count: { _all: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { staffId: "desc" } },
        take: 5,
      }),
    ]);
    const staffIds = staffGroups.map((x) => x.staffId);
    const staff = await prisma.staffProfile.findMany({
      where: { id: { in: staffIds } },
      include: { user: { select: { fullName: true } } },
    });
    const days = new Map<
      string,
      {
        date: string;
        serviceRevenue: number;
        productRevenue: number;
        total: number;
      }
    >();
    for (
      let d = new Date(from);
      d <= to;
      d = new Date(d.getTime() + 86400000)
    ) {
      const k = key(d);
      days.set(k, { date: k, serviceRevenue: 0, productRevenue: 0, total: 0 });
    }
    for (const x of appointments) {
      const d = days.get(key(x.startAt));
      if (d) {
        d.serviceRevenue += num(x.totalPrice);
        d.total += num(x.totalPrice);
      }
    }
    for (const x of orders) {
      const d = days.get(key(x.createdAt));
      if (d) {
        d.productRevenue += num(x.total);
        d.total += num(x.total);
      }
    }
    const serviceRevenue = appointments.reduce(
        (n, x) => n + num(x.totalPrice),
        0,
      ),
      productRevenue = orders.reduce((n, x) => n + num(x.total), 0);
    const statusCounts = Object.fromEntries(
      Object.values(AppointmentStatus).map((s) => [
        s,
        statusGroups.find((x) => x.status === s)?._count._all ?? 0,
      ]),
    );
    const appointmentTotal = Object.values(statusCounts).reduce(
      (n, v) => n + Number(v),
      0,
    );
    return {
      period: { from, to },
      kpis: {
        totalRevenue: serviceRevenue + productRevenue,
        serviceRevenue,
        productRevenue,
        completedAppointments: appointments.length,
        completedOrders: orders.length,
        newCustomers,
        cancellationRate: appointmentTotal
          ? ((Number(statusCounts.CANCELLED) + Number(statusCounts.NO_SHOW)) /
              appointmentTotal) *
            100
          : 0,
      },
      dailyRevenue: [...days.values()],
      appointmentStatuses: statusCounts,
      topServices: serviceGroups.map((x) => ({
        id: x.serviceId,
        name: x.serviceName,
        count: x._count._all,
        revenue: num(x._sum.price),
      })),
      topProducts: productGroups.map((x) => ({
        id: x.productId,
        name: x.productName,
        quantity: x._sum.quantity ?? 0,
        revenue: num(x._sum.lineTotal),
      })),
      staffPerformance: staffGroups.map((x) => ({
        id: x.staffId,
        name:
          staff.find((y) => y.id === x.staffId)?.user.fullName ?? "Nhân viên",
        appointments: x._count._all,
        revenue: num(x._sum.totalPrice),
      })),
      lowStock,
    };
  },
  async csv(input: { dateFrom?: Date; dateTo?: Date }) {
    const { from, to } = range(input);
    const [a, o] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          status: AppointmentStatus.COMPLETED,
          startAt: { gte: from, lte: to },
        },
        include: {
          customer: { include: { user: true } },
          staff: { include: { user: true } },
        },
        orderBy: { startAt: "asc" },
      }),
      prisma.order.findMany({
        where: {
          status: OrderStatus.COMPLETED,
          createdAt: { gte: from, lte: to },
        },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
    const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Loại", "Mã", "Ngày", "Khách hàng", "Nhân viên", "Doanh thu"],
      ...a.map((x) => [
        "Dịch vụ",
        x.code,
        x.startAt.toISOString(),
        x.customer.user.fullName,
        x.staff.user.fullName,
        num(x.totalPrice),
      ]),
      ...o.map((x) => [
        "Sản phẩm",
        x.code,
        x.createdAt.toISOString(),
        x.user.fullName,
        "",
        num(x.total),
      ]),
    ];
    return "\uFEFF" + rows.map((row) => row.map(esc).join(",")).join("\r\n");
  },
};
