import { db } from "@/server/db";
import { startOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function trackUsage(
  userId: string,
  type: "prompts" | "emailsScanned" | "emailsLabeled",
  count = 1
) {
  const today = startOfDay(new Date());
  
  await db.usageDaily.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      [type]: {
        increment: count,
      },
    },
    create: {
      userId,
      date: today,
      [type]: count,
    },
  });
}

export async function getDailyUsage(userId: string) {
  const today = startOfDay(new Date());
  
  const usage = await db.usageDaily.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });
  
  return {
    prompts: usage?.prompts || 0,
    emailsScanned: usage?.emailsScanned || 0,
    emailsLabeled: usage?.emailsLabeled || 0,
  };
}

export async function getMonthlyUsage(userId: string) {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());
  
  const usage = await db.usageDaily.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      prompts: true,
      emailsScanned: true,
      emailsLabeled: true,
    },
  });
  
  return {
    prompts: usage._sum.prompts || 0,
    emailsScanned: usage._sum.emailsScanned || 0,
    emailsLabeled: usage._sum.emailsLabeled || 0,
  };
}

export async function getUsageHistory(userId: string, months = 3) {
  const endDate = endOfMonth(new Date());
  const startDate = startOfMonth(subMonths(new Date(), months - 1));
  
  const usage = await db.usageDaily.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });
  
  return usage;
}

export async function getUserPlanDetails(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionPlan: true,
      subscriptionStatus: true,
      dailyQuota: true,
      lemonSubscriptionId: true,
    },
  });
  
  return user;
}