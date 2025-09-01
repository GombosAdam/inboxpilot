// Subscription Plans and Limits Configuration

export type PlanType = 'Free' | 'Starter' | 'professional' | 'business';

export interface PlanLimits {
  emailsPerMonth: number;
  retentionDays: number;
  features: string[];
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  Free: {
    emailsPerMonth: 200, // Free plan limit
    retentionDays: 7,
    features: ['basic_summary', 'categorization']
  },
  Starter: {
    emailsPerMonth: 600, // Starter plan limit
    retentionDays: 30,
    features: [
      'basic_summary',
      'categorization',
      'suggested_replies',
      'priority_detection'
    ]
  },
  professional: {
    emailsPerMonth: 20000, // Increased from 15000, no daily limits
    retentionDays: 90,
    features: [
      'basic_summary',
      'categorization', 
      'suggested_replies',
      'priority_detection',
      'custom_labels',
      'bulk_actions',
      'api_access'
    ]
  },
  business: {
    emailsPerMonth: -1, // unlimited
    retentionDays: 365,
    features: ['all']
  }
};

export function getPlanFromStatus(subscriptionStatus: string, subscriptionPlan?: string): PlanType {
  // If no active subscription, return free
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'on_trial') {
    return 'Free';
  }
  
  // Use the stored plan type if available
  if (subscriptionPlan && ['Starter', 'professional', 'business'].includes(subscriptionPlan)) {
    return subscriptionPlan as PlanType;
  }
  
  // Handle backwards compatibility - map old lowercase to new capitalized
  if (subscriptionPlan === 'starter') {
    return 'Starter';
  }
  
  // Default to Starter for active subscriptions without a plan type
  // (for backwards compatibility with existing subscriptions)
  return 'Starter';
}

export function checkLimit(
  usageThisMonth: number,
  plan: PlanType
): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[plan];
  
  if (limits.emailsPerMonth > 0 && usageThisMonth >= limits.emailsPerMonth) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${limits.emailsPerMonth} emails/month). Upgrade to process more.`
    };
  }
  
  return { allowed: true };
}

export function hasFeature(plan: PlanType, feature: string): boolean {
  const limits = PLAN_LIMITS[plan];
  return limits.features.includes('all') || limits.features.includes(feature);
}