import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [totalPets, appointmentsToday, newClientsThisMonth, weekAppointments] =
      await Promise.all([
        this.prisma.pet.count({ where: { tenantId, isDeceased: false } }),
        this.prisma.appointment.count({
          where: { tenantId, startTime: { gte: todayStart, lt: todayEnd } },
        }),
        this.prisma.owner.count({
          where: { tenantId, createdAt: { gte: firstOfMonth } },
        }),
        this.prisma.appointment.findMany({
          where: { tenantId, startTime: { gte: sevenDaysAgo } },
          select: { startTime: true },
        }),
      ]);

    const dayMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      dayMap.set(d.toISOString().split('T')[0], 0);
    }
    for (const appt of weekAppointments) {
      const day = appt.startTime.toISOString().split('T')[0];
      if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
    }
    const appointmentsPerDay = Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      totalPets,
      appointmentsToday,
      newClientsThisMonth,
      pendingPayments: 0,
      appointmentsPerDay,
    };
  }
}
