export interface AnalyticsSummary {
  period: { from: string; to: string };
  kpis: {
    totalRevenue: number;
    serviceRevenue: number;
    productRevenue: number;
    completedAppointments: number;
    completedOrders: number;
    newCustomers: number;
    cancellationRate: number;
  };
  dailyRevenue: Array<{
    date: string;
    serviceRevenue: number;
    productRevenue: number;
    total: number;
  }>;
  appointmentStatuses: Record<string, number>;
  topServices: Array<{ id: string; name: string; count: number; revenue: number }>;
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  staffPerformance: Array<{ id: string; name: string; appointments: number; revenue: number }>;
  lowStock: Array<{ id: string; name: string; sku: string; stock: number }>;
}
