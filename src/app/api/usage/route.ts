import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { getPlanFromStatus, PLAN_LIMITS } from "@/lib/subscription-limits";
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, subDays, isWeekend, getDay } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user plan details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = getPlanFromStatus(user.subscriptionStatus, user.subscriptionPlan);
    const limits = PLAN_LIMITS[plan];

    // Get current month's usage
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    
    const monthlyUsage = await prisma.usageDaily.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        prompts: true,
      },
    });

    // Get usage history for the last 6 months for better analytics
    const historyStartDate = startOfMonth(subMonths(new Date(), 5));
    const history = await prisma.usageDaily.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: historyStartDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Get last 30 days for detailed analytics
    const last30DaysStart = startOfDay(subDays(new Date(), 29));
    const last30Days = await prisma.usageDaily.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: last30DaysStart,
          lte: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate analytics
    const totalHistoricalUsage = history.reduce((sum, day) => sum + (day.prompts || 0), 0);
    const averageDaily = last30Days.length > 0 
      ? last30Days.reduce((sum, day) => sum + (day.prompts || 0), 0) / last30Days.length 
      : 0;
    
    // Day of week analysis
    const dayOfWeekStats = Array(7).fill(0); // 0=Sunday, 1=Monday, etc.
    let weekdayTotal = 0, weekendTotal = 0;
    last30Days.forEach(day => {
      const dayOfWeek = getDay(day.date);
      dayOfWeekStats[dayOfWeek] += day.prompts || 0;
      if (isWeekend(day.date)) {
        weekendTotal += day.prompts || 0;
      } else {
        weekdayTotal += day.prompts || 0;
      }
    });

    // Weekly pattern analysis
    const weeklyPattern = {
      weekdays: weekdayTotal,
      weekends: weekendTotal,
      weekdayAverage: weekdayTotal / (last30Days.filter(d => !isWeekend(d.date)).length || 1),
      weekendAverage: weekendTotal / (last30Days.filter(d => isWeekend(d.date)).length || 1)
    };

    // Monthly breakdown for last 6 months
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      const monthData = history.filter(day => 
        day.date >= monthStart && day.date <= monthEnd
      );
      const monthTotal = monthData.reduce((sum, day) => sum + (day.prompts || 0), 0);
      
      monthlyBreakdown.push({
        month: format(monthStart, "MMM yyyy"),
        date: format(monthStart, "yyyy-MM"),
        emails: monthTotal,
        days: monthData.length,
        averagePerDay: monthData.length > 0 ? monthTotal / monthData.length : 0
      });
    }

    // Usage intensity levels
    const usageIntensity = {
      light: last30Days.filter(d => (d.prompts || 0) <= 5).length,
      moderate: last30Days.filter(d => (d.prompts || 0) > 5 && (d.prompts || 0) <= 20).length,
      heavy: last30Days.filter(d => (d.prompts || 0) > 20).length,
    };

    // Peak usage day
    const peakDay = last30Days.reduce((max, day) => 
      (day.prompts || 0) > (max.prompts || 0) ? day : max, 
      { prompts: 0, date: new Date() }
    );

    // Transform history to match expected format
    const transformedHistory = history.map(day => ({
      date: format(day.date, "yyyy-MM-dd"),
      prompts: day.prompts || 0,
      emailsScanned: day.prompts || 0,
      emailsLabeled: day.prompts || 0,
    }));

    // Last 30 days for detailed chart
    const last30DaysChart = last30Days.map(day => ({
      date: format(day.date, "yyyy-MM-dd"),
      day: format(day.date, "EEE"),
      emails: day.prompts || 0,
      isWeekend: isWeekend(day.date)
    }));

    const monthlyTotal = monthlyUsage._sum.prompts || 0;

    return NextResponse.json({
      plan,
      usage: {
        month: monthlyTotal,
      },
      limits: {
        monthly: limits.emailsPerMonth,
      },
      monthlyUsage: {
        prompts: monthlyTotal,
        emailsScanned: monthlyTotal,
        emailsLabeled: monthlyTotal,
      },
      history: transformedHistory,
      planDetails: {
        subscriptionPlan: plan,
        subscriptionStatus: user.subscriptionStatus,
        monthlyQuota: limits.emailsPerMonth,
      },
      analytics: {
        totalHistoricalUsage,
        averageDaily: Math.round(averageDaily * 10) / 10,
        monthlyBreakdown,
        weeklyPattern,
        dayOfWeekStats,
        usageIntensity,
        peakUsage: {
          day: format(peakDay.date, "MMM dd, yyyy"),
          emails: peakDay.prompts || 0
        },
        last30Days: last30DaysChart,
        trends: {
          isIncreasing: monthlyBreakdown.length >= 2 && 
            monthlyBreakdown[monthlyBreakdown.length - 1].emails > monthlyBreakdown[monthlyBreakdown.length - 2].emails,
          monthOverMonth: monthlyBreakdown.length >= 2 
            ? ((monthlyBreakdown[monthlyBreakdown.length - 1].emails - monthlyBreakdown[monthlyBreakdown.length - 2].emails) / 
               (monthlyBreakdown[monthlyBreakdown.length - 2].emails || 1) * 100)
            : 0
        }
      }
    });
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}