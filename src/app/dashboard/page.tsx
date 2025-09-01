'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Mail, TrendingUp, Briefcase, CheckCircle, Settings, LogOut, User, Sparkles, Zap, Clock, BarChart3, AlertCircle, Building2, Tag, ArrowRight, Trash2 } from 'lucide-react';
import { Brand } from '@/components/Brand';

interface UsageData {
  plan: string;
  usage: {
    month: number;
  };
  limits: {
    monthly: number;
  };
  canProcess: boolean;
  limitReason?: string;
}

interface EmailStats {
  totalEmails: number;
  highPriority: number;
  workEmails: number;
}

interface CleanupData {
  plan: string;
  retentionDays: number;
  totalEmails: number;
  activeEmails: number;
  archivedEmails: number;
  emailsToArchive: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalEmails: 0,
    highPriority: 0,
    workEmails: 0
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cleanupData, setCleanupData] = useState<CleanupData | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      // Still loading, do nothing
      return;
    }
    
    if (status === 'unauthenticated' || !session) {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session) {
      handleSubscriptionSuccess();
      fetchUsageData();
      fetchEmailStats();
      fetchCleanupData();
    }
  }, [session, status, router]);

  const handleSubscriptionSuccess = async () => {
    const subscription = searchParams.get('subscription');
    const plan = searchParams.get('plan');
    const isDev = searchParams.get('dev');
    
    if (subscription === 'success' && plan && isDev === 'true') {
      try {
        // Update user's subscription in development mode
        const response = await fetch('/api/subscription/dev-upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan })
        });
        
        if (response.ok) {
          // Clear URL parameters and refresh data
          router.replace('/dashboard');
          // Refresh usage data to show new limits
          setTimeout(async () => {
            await fetchUsageData();
            alert(`🎉 Successfully upgraded to ${plan} plan! (Development Mode)`);
          }, 500);
        } else {
          console.error('Failed to upgrade subscription');
        }
      } catch (error) {
        console.error('Error upgrading subscription:', error);
      }
    }
  };

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/check-usage');
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      } else {
        console.error('Failed to fetch usage data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setDataLoaded(true);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/emails');
      if (response.ok) {
        const data = await response.json();
        const emails = data.emails || [];
        setEmailStats({
          totalEmails: emails.length,
          highPriority: emails.filter((e: any) => e.priority?.toLowerCase() === 'high').length,
          workEmails: emails.filter((e: any) => e.label?.toLowerCase() === 'work').length
        });
      } else {
        console.error('Failed to fetch email stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
    }
  };

  const fetchCleanupData = async () => {
    try {
      const response = await fetch('/api/emails/cleanup');
      if (response.ok) {
        const data = await response.json();
        setCleanupData(data);
      } else {
        console.error('Failed to fetch cleanup data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch cleanup data:', error);
    }
  };

  const handleCleanup = async () => {
    if (!cleanupData?.emailsToArchive || cleanupData.emailsToArchive === 0) {
      alert('No old emails found to archive.');
      return;
    }

    if (!confirm(`Are you sure you want to archive ${cleanupData.emailsToArchive} emails older than ${cleanupData.retentionDays} days? This action cannot be undone.`)) {
      return;
    }

    setCleanupLoading(true);
    try {
      const response = await fetch('/api/emails/cleanup', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Cleanup completed! Archived ${data.archived} emails and permanently deleted ${data.deleted} old archived emails.`);
        await Promise.all([fetchEmailStats(), fetchCleanupData()]);
      } else {
        alert(`❌ Cleanup failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('❌ Cleanup failed. Please try again.');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        if (data.emailsProcessed === 0) {
          alert('✅ Sync completed! No new unread emails found.');
        } else {
          alert(`✅ Success! Processed ${data.emailsProcessed} emails with AI summaries.`);
        }
        fetchUsageData();
        fetchEmailStats();
        fetchCleanupData();
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Sync failed. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const handleResetAccount = async () => {
    if (!confirm('🚨 Are you sure you want to reset all your account data? This will delete all emails and usage statistics. This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-account' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Account reset successful! Deleted ${data.deleted.emails} emails and ${data.deleted.usageRecords} usage records.`);
        fetchUsageData();
        fetchEmailStats();
      } else {
        alert(`❌ Reset failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('❌ Reset failed. Please check your connection and try again.');
    }
  };

  if (status === 'loading' || (!session && status !== 'unauthenticated')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-300">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-in fade-in duration-300">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  const usagePercentage = Math.min(100, ((usageData?.usage.month || 0) / (usageData?.limits.monthly || 200)) * 100);
  const processedPercentage = emailStats.totalEmails > 0 ? Math.min(100, ((usageData?.usage.month || 0) / emailStats.totalEmails) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Brand />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg transition-all hover:bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">Gmail Connected</span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 animate-in fade-in duration-500">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {session.user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Top Row - Key Metrics (Equal Heights) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Plan Usage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-48 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{usageData?.plan || 'Free'} Plan</h3>
                <p className="text-gray-500 text-sm">Current subscription</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage this month</span>
                  <span className="font-semibold text-gray-900">
                    {usageData?.usage.month || 0} / {usageData?.limits.monthly || 200}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 bg-gray-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                {Math.max(0, (usageData?.limits.monthly || 200) - (usageData?.usage.month || 0))} emails remaining
              </p>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-48 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">This Month</h3>
                <p className="text-gray-500 text-sm">AI processed emails</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-4xl font-bold text-gray-900 mb-3 transition-all duration-500">
                {usageData?.usage.month || 0}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-green-700 text-sm font-medium">
                  ~{((usageData?.usage.month || 0) * 2.5).toFixed(0)} minutes saved
                </span>
              </div>
            </div>
          </div>

          {/* AI Processing CTA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-48 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Processing</h3>
                <p className="text-gray-500 text-sm">Sync your Gmail inbox</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <button 
                onClick={handleSync}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-4 w-4" />
                {loading ? 'Processing...' : 'Process Inbox'}
              </button>
            </div>
          </div>
        </div>

        {/* Middle Row - Email Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Email Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email Categories</h3>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {emailStats.totalEmails} total
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Work Related */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">Work Related</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{emailStats.workEmails}</span>
                    <span className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                      {emailStats.totalEmails > 0 ? Math.round((emailStats.workEmails / emailStats.totalEmails) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: emailStats.totalEmails > 0 ? `${(emailStats.workEmails / emailStats.totalEmails) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* High Priority */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-gray-700 font-medium">High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{emailStats.highPriority}</span>
                    <span className="text-amber-600 text-sm font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                      {emailStats.totalEmails > 0 ? Math.round((emailStats.highPriority / emailStats.totalEmails) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: emailStats.totalEmails > 0 ? `${(emailStats.highPriority / emailStats.totalEmails) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Personal */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700 font-medium">Personal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{Math.max(0, Math.floor(emailStats.totalEmails * 0.3))}</span>
                    <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      30%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: '30%' }}
                  ></div>
                </div>
              </div>
              
              {/* Promotional */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <span className="text-gray-700 font-medium">Promotional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{Math.max(0, emailStats.totalEmails - emailStats.workEmails - emailStats.highPriority - Math.floor(emailStats.totalEmails * 0.3))}</span>
                    <span className="text-purple-600 text-sm font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                      {emailStats.totalEmails > 0 ? Math.round(((emailStats.totalEmails - emailStats.workEmails - emailStats.highPriority - Math.floor(emailStats.totalEmails * 0.3)) / emailStats.totalEmails) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: emailStats.totalEmails > 0 ? `${((emailStats.totalEmails - emailStats.workEmails - emailStats.highPriority - Math.floor(emailStats.totalEmails * 0.3)) / emailStats.totalEmails) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => router.push('/emails')}
                className="w-full text-indigo-600 hover:text-white hover:bg-indigo-600 text-sm font-medium py-3 px-4 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-all duration-200 hover:scale-[1.01] hover:shadow-md flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                View All Emails
              </button>
            </div>
          </div>

          {/* Processing Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">AI Processed</span>
                  <span className="font-semibold text-gray-900">{usageData?.usage.month || 0}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 font-medium">Remaining</span>
                  <span className="font-semibold text-gray-900">
                    {Math.max(0, emailStats.totalEmails - (usageData?.usage.month || 0))}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="h-2.5 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${processedPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-500 text-xs">Progress</span>
                  <span className="text-indigo-600 text-xs font-semibold">{processedPercentage.toFixed(0)}% complete</span>
                </div>
              </div>
              
              {emailStats.totalEmails > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 transition-all duration-500">{emailStats.totalEmails}</div>
                      <div className="text-gray-500 text-xs font-medium">Total Emails</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600 transition-all duration-500">{usageData?.usage.month || 0}</div>
                      <div className="text-indigo-600 text-xs font-medium">Processed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Account & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Account Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Account</h3>
              </div>
              <button 
                onClick={() => router.push('/plan')}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Manage →
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-600">Current Plan</span>
                <span className="font-semibold text-gray-900">{usageData?.plan || 'Free'}</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-600">Monthly Limit</span>
                <span className="font-semibold text-gray-900">{usageData?.limits.monthly || 200} emails</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-600">Gmail Account</span>
                <span className="font-semibold text-gray-900 truncate ml-2">{session.user?.email}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
              <button 
                onClick={() => router.push('/plan')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Upgrade Plan
              </button>
              
              {/* Development Reset Button */}
              <button 
                onClick={handleResetAccount}
                className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                🧹 Reset Account Data (Testing)
              </button>
            </div>
          </div>

          {/* Productivity Impact */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Productivity Impact</h3>
            </div>
            
            {usageData?.usage.month && usageData.usage.month > 0 ? (
              <div className="space-y-4">
                <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                  <div className="text-4xl font-bold text-green-600 mb-2 transition-all duration-500">
                    {(usageData.usage.month * 2.5).toFixed(0)}
                  </div>
                  <div className="text-green-700 font-semibold mb-1">Minutes Saved</div>
                  <div className="text-green-600 text-sm">This month</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-xl font-bold text-gray-900">{usageData.usage.month}</div>
                    <div className="text-gray-500 text-sm">Emails Processed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-xl font-bold text-gray-900">{Math.round(usageData.usage.month / 30)}</div>
                    <div className="text-gray-500 text-sm">Daily Average</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Mail className="h-12 w-12 mx-auto mb-3 animate-pulse" />
                </div>
                <h4 className="font-semibold text-gray-700 mb-2">Ready to get started?</h4>
                <p className="text-gray-500 text-sm mb-4">
                  Process your first emails to see productivity insights here.
                </p>
                <button 
                  onClick={handleSync}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Start Processing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Email Insights (Only show if user has emails) */}
        {emailStats.totalEmails > 0 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Insights</h3>
                </div>
                <span className="text-gray-500 text-sm">Last updated just now</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{emailStats.totalEmails}</div>
                  <div className="text-gray-600 text-sm font-medium">Total Emails</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{emailStats.workEmails}</div>
                  <div className="text-gray-600 text-sm font-medium">Work Related</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-amber-600 mb-1">{emailStats.highPriority}</div>
                  <div className="text-gray-600 text-sm font-medium">High Priority</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-105">
                  <div className="text-2xl font-bold text-green-600 mb-1">{usageData?.usage.month || 0}</div>
                  <div className="text-gray-600 text-sm font-medium">AI Processed</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Email Cleanup Section */}
        {cleanupData && (
          <div className="mt-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Management</h3>
                    <p className="text-sm text-gray-600">
                      {cleanupData.plan} Plan: {cleanupData.retentionDays} days retention policy
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/plan')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                  Settings →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{cleanupData.totalEmails}</div>
                  <div className="text-gray-600 text-sm font-medium">Total Emails</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">{cleanupData.activeEmails}</div>
                  <div className="text-gray-600 text-sm font-medium">Active</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 mb-1">{cleanupData.archivedEmails}</div>
                  <div className="text-gray-600 text-sm font-medium">Archived</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600 mb-1">{cleanupData.emailsToArchive}</div>
                  <div className="text-gray-600 text-sm font-medium">Ready to Archive</div>
                </div>
              </div>
              
              {cleanupData.emailsToArchive > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-amber-800">
                        {cleanupData.emailsToArchive} emails ready for manual archiving
                      </div>
                      <div className="text-sm text-amber-700 mt-1">
                        These emails are older than {cleanupData.retentionDays} days and haven't been auto-archived yet. This usually happens when you haven't synced recently.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Automatic cleanup is working perfectly</div>
                      <div className="text-sm text-green-700 mt-1">
                        All emails are within your {cleanupData.retentionDays}-day retention policy. Cleanup runs automatically when you sync emails.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Smart Action Buttons: Show cleanup when needed, show stats when clean */}
              {cleanupData.emailsToArchive > 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleCleanup}
                    disabled={cleanupLoading}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {cleanupLoading ? 'Archiving...' : `Archive ${cleanupData.emailsToArchive} Emails`}
                  </button>
                  <button 
                    onClick={fetchCleanupData}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Refresh Status
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cleanup History/Stats when nothing to clean */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Retention Summary</h4>
                      <span className="text-xs text-gray-500">Last checked: just now</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retention Policy:</span>
                        <span className="ml-2 font-semibold text-gray-900">{cleanupData.retentionDays} days</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Plan Level:</span>
                        <span className="ml-2 font-semibold text-gray-900">{cleanupData.plan}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Auto-Archive:</span>
                        <span className="ml-2 font-semibold text-green-600">✓ Active</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Archived Total:</span>
                        <span className="ml-2 font-semibold text-gray-900">{cleanupData.archivedEmails}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={fetchCleanupData}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Refresh Status
                    </button>
                    <button 
                      onClick={() => router.push('/plan')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Manage Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}