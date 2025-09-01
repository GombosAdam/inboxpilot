'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { PlanPageSkeleton, ChartSkeleton } from '@/components/SkeletonLoaders';
import { AnalyticsLoadingState, PageLoadingState } from '@/components/ProcessLoadingStates';

interface UsageData {
  plan: string;
  usage: {
    month: number;
  };
  limits: {
    monthly: number;
  };
  monthlyUsage: {
    prompts: number;
    emailsScanned: number;
    emailsLabeled: number;
  };
  planDetails: {
    subscriptionPlan: string;
    subscriptionStatus: string;
    monthlyQuota: number;
  };
  analytics: {
    totalHistoricalUsage: number;
    averageDaily: number;
    monthlyBreakdown: Array<{
      month: string;
      date: string;
      emails: number;
      days: number;
      averagePerDay: number;
    }>;
    weeklyPattern: {
      weekdays: number;
      weekends: number;
      weekdayAverage: number;
      weekendAverage: number;
    };
    dayOfWeekStats: number[];
    usageIntensity: {
      light: number;
      moderate: number;
      heavy: number;
    };
    peakUsage: {
      day: string;
      emails: number;
    };
    last30Days: Array<{
      date: string;
      day: string;
      emails: number;
      isWeekend: boolean;
    }>;
    trends: {
      isIncreasing: boolean;
      monthOverMonth: number;
    };
  };
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function PlanContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    } else {
      fetchUsageData();
      handlePlanChangeSuccess();
    }
  }, [session, router]);

  const handlePlanChangeSuccess = async () => {
    const subscription = searchParams.get('subscription');
    const plan = searchParams.get('plan');
    const isDev = searchParams.get('dev');
    
    if (subscription === 'success' && plan && isDev === 'true') {
      // Clear URL parameters
      router.replace('/plan');
      // Refresh data to show new limits
      setTimeout(async () => {
        await fetchUsageData();
        alert(`🎉 Successfully switched to ${plan} plan! Check your new limits.`);
      }, 1000);
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string = 'starter') => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
      
      // If it's a development checkout, the URL will redirect back here
      // We'll handle the refresh in the URL parameter handling
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const handleDowngrade = async () => {
    if (!confirm('Are you sure you want to downgrade to the Free plan? You will lose access to premium features.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        // Refresh the data instead of full page reload
        await fetchUsageData();
        // Clear the URL and refresh if needed
        if (window.location.href.includes('?')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        alert(`Failed to downgrade: ${data.error}`);
      }
    } catch (error) {
      console.error('Downgrade error:', error);
      alert('Failed to downgrade. Please try again.');
    }
  };

  if (!session) {
    return <PageLoadingState 
      title="Loading Analytics Dashboard" 
      description="Preparing your usage insights and analytics"
      icon="📊" 
    />;
  }

  if (loading) {
    return <PlanPageSkeleton />;
  }

  const monthlyUsagePercent = usageData?.limits.monthly && usageData.limits.monthly > 0 
    ? (usageData.usage.month / usageData.limits.monthly) * 100 
    : 0;

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'Free': return 'Free Trial';
      case 'Starter': return 'Starter';
      case 'starter': return 'Starter'; // backwards compatibility
      case 'professional': return 'Professional';
      case 'business': return 'Business';
      default: return 'Free Trial';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Free': return 'from-gray-500 to-gray-600';
      case 'Starter': 
      case 'starter': return 'from-blue-500 to-blue-600'; // support both for backwards compatibility
      case 'professional': return 'from-purple-500 to-purple-600';
      case 'business': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const maxEmails = Math.max(...(usageData?.analytics.last30Days.map(d => d.emails) || [1]));

  return (
    <div className="min-h-screen bg-slate-50" style={{background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'}}>
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-xl bg-white/95 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="p-2 rounded-xl" style={{background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)'}}>
                <span className="text-white font-bold text-xl">📧</span>
              </div>
              <span className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '700', letterSpacing: '-0.025em'}}>
                InboxPilot
              </span>
            </div>
            <div className="px-4 py-2 rounded-full text-white font-medium bg-indigo-600">
              {getPlanName(usageData?.plan || 'Free')} Plan
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2" style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '800', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #0F172A 0%, #374151 50%, #6D28D9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Analytics & Usage Report
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">Track your email processing performance and usage metrics</p>
          </div>
            
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{usageData?.usage.month || 0}</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Emails This Month</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{usageData?.analytics.averageDaily || 0}</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Daily Average</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{usageData?.analytics.totalHistoricalUsage || 0}</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Total Processed</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{usageData?.analytics.peakUsage.emails || 0}</div>
              <div className="text-sm text-gray-600 font-medium mt-1">Peak Day Usage</div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'trends', label: 'Trends & Patterns' },
              { id: 'insights', label: 'Performance Insights' },
              { id: 'plan', label: 'Plan Details' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Usage Progress */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold mb-6" style={{fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #0F172A, #6D28D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                Monthly Usage Progress
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">Emails Processed This Month</span>
                    <span className="font-bold text-3xl text-gray-900">
                      {usageData?.usage.month || 0}
                      {usageData?.limits.monthly && usageData.limits.monthly > 0 && (
                        <span className="text-lg text-gray-500 ml-2">/ {usageData.limits.monthly}</span>
                      )}
                    </span>
                  </div>
                  
                  {usageData?.limits.monthly && usageData.limits.monthly > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            monthlyUsagePercent > 90 ? 'bg-red-500' :
                            monthlyUsagePercent > 75 ? 'bg-amber-500' :
                            'bg-indigo-600'
                          }`}
                          style={{width: `${Math.min(monthlyUsagePercent, 100)}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{monthlyUsagePercent.toFixed(1)}% used</span>
                        <span>{Math.max(0, usageData.limits.monthly - usageData.usage.month)} remaining</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div className="bg-indigo-600 h-3 rounded-full w-full"></div>
                      </div>
                      <p className="text-gray-700 font-medium">Unlimited usage available</p>
                    </>
                  )}
                </div>

                {/* Trend Indicator */}
                {usageData?.analytics.trends && (
                  <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {usageData.analytics.trends.isIncreasing ? 'Usage Trending Up' : 'Steady Usage Pattern'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {usageData.analytics.trends.monthOverMonth > 0 ? '+' : ''}{usageData.analytics.trends.monthOverMonth.toFixed(1)}% from last month
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-700">
                        {usageData.analytics.trends.isIncreasing ? '↗' : '→'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Last 30 Days Chart */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Last 30 Days Activity
              </h3>
              
              <div className="h-64 flex items-end gap-1 mb-4">
                {usageData?.analytics.last30Days.map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div className="relative w-full">
                      <div
                        className={`w-full rounded-t transition-all duration-300 group-hover:opacity-80 ${
                          day.isWeekend 
                            ? 'bg-gray-400' 
                            : 'bg-indigo-600'
                        }`}
                        style={{
                          height: `${Math.max((day.emails / (maxEmails || 1)) * 200, 2)}px`,
                        }}
                      ></div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.emails} emails
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {day.day}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                  <span className="text-gray-600">Weekdays</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span className="text-gray-600">Weekends</span>
                </div>
              </div>
            </div>

            {/* Usage Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Usage Patterns */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Usage Patterns
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Weekday Average</div>
                      <div className="text-sm text-gray-600">Monday - Friday</div>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {usageData?.analytics.weeklyPattern.weekdayAverage.toFixed(1) || '0'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Weekend Average</div>
                      <div className="text-sm text-gray-600">Saturday - Sunday</div>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {usageData?.analytics.weeklyPattern.weekendAverage.toFixed(1) || '0'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak Usage */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Peak Performance
                </h3>
                
                <div className="text-center">
                  <div className="bg-gray-50 rounded-lg p-6 mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {usageData?.analytics.peakUsage.emails || 0} emails
                    </div>
                    <div className="text-gray-600">
                      Peak day: {usageData?.analytics.peakUsage.day || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Highest daily processing volume
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* Monthly Breakdown */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                6-Month Trend Analysis
              </h3>
              
              <div className="h-64 flex items-end gap-4 mb-6">
                {usageData?.analytics.monthlyBreakdown.map((month, index) => {
                  const maxMonthly = Math.max(...usageData.analytics.monthlyBreakdown.map(m => m.emails));
                  return (
                    <div key={month.date} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        <div
                          className="w-full bg-indigo-600 rounded-t transition-all duration-500 hover:bg-indigo-700"
                          style={{
                            height: `${Math.max((month.emails / (maxMonthly || 1)) * 200, 4)}px`,
                          }}
                        ></div>
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <div className="font-bold">{month.emails} emails</div>
                          <div>{month.averagePerDay.toFixed(1)}/day avg</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 text-center font-medium">
                        {month.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day of Week Analysis */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Day-of-Week Analysis
              </h3>
              
              <div className="grid grid-cols-7 gap-4 mb-6">
                {dayNames.map((day, index) => {
                  const isWeekend = index === 0 || index === 6;
                  const dayUsage = usageData?.analytics.dayOfWeekStats[index] || 0;
                  const maxDayUsage = Math.max(...(usageData?.analytics.dayOfWeekStats || [1]));
                  
                  return (
                    <div key={day} className="text-center">
                      <div className="mb-2">
                        <div
                          className={`mx-auto rounded-full transition-all duration-500 ${
                            isWeekend 
                              ? 'bg-gray-400' 
                              : 'bg-indigo-600'
                          }`}
                          style={{
                            width: '60px',
                            height: `${Math.max((dayUsage / (maxDayUsage || 1)) * 80, 8)}px`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{day}</div>
                      <div className="text-xs text-gray-500">{dayUsage}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-3">Weekly Summary</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Most Active Day:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {dayNames[usageData?.analytics.dayOfWeekStats.indexOf(Math.max(...(usageData?.analytics.dayOfWeekStats || []))) || 0]}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Weekend vs Weekday:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {((usageData?.analytics.weeklyPattern.weekendAverage || 0) / (usageData?.analytics.weeklyPattern.weekdayAverage || 1) * 100).toFixed(0)}% weekend activity
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Intensity */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Usage Intensity Distribution
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">{usageData?.analytics.usageIntensity.light || 0}</div>
                  <div className="text-gray-900 font-medium">Light Days</div>
                  <div className="text-sm text-gray-600 mt-1">≤ 5 emails/day</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">{usageData?.analytics.usageIntensity.moderate || 0}</div>
                  <div className="text-gray-900 font-medium">Moderate Days</div>
                  <div className="text-sm text-gray-600 mt-1">6-20 emails/day</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-2">{usageData?.analytics.usageIntensity.heavy || 0}</div>
                  <div className="text-gray-900 font-medium">Heavy Days</div>
                  <div className="text-sm text-gray-600 mt-1">20+ emails/day</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            {/* Performance Insights Dashboard */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Performance Insights
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Email Processing Efficiency */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Processing Efficiency</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Daily Processing</span>
                      <span className="font-semibold text-gray-900">{usageData?.analytics.averageDaily || 0} emails</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Performance</span>
                      <span className="font-semibold text-gray-900">{usageData?.analytics.peakUsage.emails || 0} emails</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consistency Score</span>
                      <span className="font-semibold text-gray-900">
                        {usageData?.analytics.usageIntensity.moderate && usageData.analytics.usageIntensity.light
                          ? Math.round(((usageData.analytics.usageIntensity.moderate + usageData.analytics.usageIntensity.light) / 30) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Recommendations */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Usage Recommendations</h4>
                  
                  <div className="space-y-3 text-sm">
                    {usageData?.analytics.weeklyPattern.weekendAverage && usageData.analytics.weeklyPattern.weekdayAverage ? (
                      usageData.analytics.weeklyPattern.weekendAverage < usageData.analytics.weeklyPattern.weekdayAverage * 0.3 ? (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-gray-900">Weekend Optimization</div>
                          <div className="text-gray-600 text-sm">Consider processing weekend emails on Monday for better work-life balance.</div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-gray-900">Consistent Usage Pattern</div>
                          <div className="text-gray-600 text-sm">Your usage pattern shows good consistency across weekdays and weekends.</div>
                        </div>
                      )
                    ) : null}
                    
                    {usageData?.analytics.trends.isIncreasing && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="font-medium text-gray-900">Growth Trend</div>
                        <div className="text-gray-600 text-sm">Usage increasing by {usageData.analytics.trends.monthOverMonth.toFixed(1)}% - consider upgrading your plan.</div>
                      </div>
                    )}
                    
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="font-medium text-gray-900">Most Active Day</div>
                      <div className="text-gray-600 text-sm">Your highest usage is on {dayNames[usageData?.analytics.dayOfWeekStats.indexOf(Math.max(...(usageData?.analytics.dayOfWeekStats || []))) || 0]}. Consider scheduling important email reviews then.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Key Performance Metrics
              </h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xl font-bold text-gray-900 mb-1">{((usageData?.analytics.averageDaily || 0) * 30).toFixed(0)}</div>
                  <div className="text-gray-600 text-sm font-medium">Projected Monthly</div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {usageData?.limits.monthly && usageData.limits.monthly > 0 
                      ? Math.max(0, 100 - monthlyUsagePercent).toFixed(0) 
                      : '∞'}%
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Quota Remaining</div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {usageData?.analytics.usageIntensity.heavy || 0}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">High Activity Days</div>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {(usageData?.analytics.trends.monthOverMonth || 0) > 0 ? '+' : ''}{(usageData?.analytics.trends.monthOverMonth || 0).toFixed(1)}%
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Month-over-Month</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-8">
            {/* Current Plan Status */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Current Plan Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
                }}>
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }}></div>
                  
                  {/* Gradient orb effects */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
                  
                  <div className="relative p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Plan badge */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                          {usageData?.planDetails.subscriptionStatus === 'active' ? 'Active' : 
                           usageData?.planDetails.subscriptionStatus === 'on_trial' ? 'Trial' : 'Current'}
                        </span>
                      </div>
                      
                      {/* Plan name with elegant typography */}
                      <div>
                        <h4 className="text-3xl font-light text-white mb-1" style={{
                          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                          letterSpacing: '-0.02em'
                        }}>
                          {getPlanName(usageData?.plan || 'Free')}
                        </h4>
                        <div className="text-sm text-white/70 font-medium">
                          {usageData?.planDetails.subscriptionStatus === 'active' ? 'Subscription Plan' : 
                           usageData?.planDetails.subscriptionStatus === 'on_trial' ? 'Trial Period Active' : 'Starter Plan'}
                        </div>
                      </div>
                      
                      {/* Decorative element */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h5 className="font-semibold text-gray-900 mb-4">Plan Features</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Monthly Email Limit</span>
                        <span className="font-bold text-gray-900">
                          {usageData?.limits.monthly && usageData.limits.monthly > 0 
                            ? `${usageData.limits.monthly.toLocaleString()} emails` 
                            : 'Unlimited'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">AI Processing</span>
                        <span className="font-bold text-green-600">✓ Included</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Smart Categorization</span>
                        <span className="font-bold text-green-600">✓ Included</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Priority Detection</span>
                        <span className={`font-bold ${usageData?.plan === 'Free' ? 'text-gray-400' : 'text-green-600'}`}>
                          {usageData?.plan === 'Free' ? '○ Upgrade Required' : '✓ Included'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Advanced Analytics</span>
                        <span className={`font-bold ${usageData?.plan === 'Free' ? 'text-gray-400' : 'text-green-600'}`}>
                          {usageData?.plan === 'Free' ? '○ Upgrade Required' : '✓ Included'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Actions */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                    <div className="text-center">
                      {usageData?.plan === 'Free' ? (
                        <>
                          <h5 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Available</h5>
                          <p className="text-gray-700 mb-4">Get 600 emails/month + advanced features</p>
                          <button 
                            onClick={() => handleSubscribe('starter')}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            Upgrade to Starter - $9/month
                          </button>
                        </>
                      ) : (
                        <>
                          <h5 className="text-lg font-semibold text-gray-900 mb-2">Plan Management</h5>
                          <p className="text-gray-700 mb-4">Switch between plans or manage your subscription</p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {usageData?.plan === 'starter' && (
                              <button 
                                onClick={() => handleSubscribe('professional')}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                              >
                                Upgrade to Pro - $29/month
                              </button>
                            )}
                            <button 
                              onClick={handleDowngrade}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                            >
                              Downgrade to Free
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Comparison */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-8">Plan Comparison</h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { name: 'Free', plan: 'Free', price: '$0', emails: '200', retention: '7 days', features: ['Basic AI Processing', 'Email Summaries', 'Simple Analytics'] },
                  { name: 'Starter', plan: 'Starter', price: '$9', emails: '600', retention: '30 days', features: ['Advanced AI Processing', 'Priority Detection', 'Detailed Analytics', 'Smart Categories'] },
                  { name: 'Professional', plan: 'professional', price: '$29', emails: '20,000', retention: '90 days', features: ['Everything in Starter', 'Custom Rules', 'Team Analytics', 'API Access'] },
                  { name: 'Business', plan: 'business', price: '$99', emails: 'Unlimited', retention: '365 days', features: ['Everything in Pro', 'White-label Options', 'Priority Support', 'Custom Integrations'] }
                ].map((planInfo) => (
                  <div key={planInfo.plan} className={`rounded-lg p-6 border-2 ${
                    usageData?.plan === planInfo.plan 
                      ? 'border-gray-900 bg-gray-900 text-white' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="text-center mb-6">
                      <h4 className={`text-xl font-bold mb-2 ${usageData?.plan === planInfo.plan ? 'text-white' : 'text-gray-900'}`}>
                        {planInfo.name}
                      </h4>
                      <div className={`text-3xl font-bold mb-1 ${usageData?.plan === planInfo.plan ? 'text-white' : 'text-gray-900'}`}>
                        {planInfo.price}
                      </div>
                      <div className={`text-sm ${usageData?.plan === planInfo.plan ? 'text-white/80' : 'text-gray-500'}`}>
                        per month
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className={`text-center p-3 rounded-lg ${
                        usageData?.plan === planInfo.plan ? 'bg-white/10' : 'bg-gray-50'
                      }`}>
                        <div className={`text-lg font-bold ${usageData?.plan === planInfo.plan ? 'text-white' : 'text-gray-900'}`}>
                          {planInfo.emails} emails
                        </div>
                        <div className={`text-sm ${usageData?.plan === planInfo.plan ? 'text-white/80' : 'text-gray-500'}`}>
                          per month
                        </div>
                      </div>
                      
                      <div className={`text-center p-3 rounded-lg border ${
                        usageData?.plan === planInfo.plan ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className={`text-sm font-medium ${usageData?.plan === planInfo.plan ? 'text-white/90' : 'text-gray-700'}`}>
                          Email Retention
                        </div>
                        <div className={`text-lg font-bold ${usageData?.plan === planInfo.plan ? 'text-white' : 'text-gray-900'}`}>
                          {planInfo.retention}
                        </div>
                      </div>
                      
                      {planInfo.features.map((feature, index) => (
                        <div key={index} className={`flex items-center text-sm ${
                          usageData?.plan === planInfo.plan ? 'text-white' : 'text-gray-600'
                        }`}>
                          <svg className={`w-4 h-4 mr-2 ${usageData?.plan === planInfo.plan ? 'text-white' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {usageData?.plan === planInfo.plan ? (
                      <div className="bg-white/10 text-white text-center py-3 rounded-lg font-medium">
                        Current Plan
                      </div>
                    ) : planInfo.plan === 'Free' ? (
                      <button 
                        onClick={handleDowngrade}
                        className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        Downgrade
                      </button>
                    ) : planInfo.plan === 'Starter' ? (
                      <button 
                        onClick={() => handleSubscribe('starter')}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Switch to Starter
                      </button>
                    ) : planInfo.plan === 'professional' ? (
                      <button 
                        onClick={() => handleSubscribe('professional')}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Switch to Pro
                      </button>
                    ) : (
                      <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed">
                        Coming Soon
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>}>
      <PlanContent />
    </Suspense>
  );
}