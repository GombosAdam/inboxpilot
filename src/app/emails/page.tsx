'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Brand } from '@/components/Brand';
import { EmailSidebar } from '@/components/EmailSidebar';
import { ModernEmailList } from '@/components/ModernEmailList';

interface EmailSummary {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  summary: string;
  priority: string;
  label: string;
  suggestedReply?: string;
  createdAt: string;
  read: boolean;
  starred: boolean;
}

export default function EmailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchEmails();
  }, [session, router]);

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      if (response.ok) {
        setEmails(data.emails || []);
      } else {
        console.error('Failed to fetch emails:', data.error);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async (action: string, email: any, emailIds?: string[]) => {
    if (action === 'mark-as-read') {
      try {
        const response = await fetch('/api/emails', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'mark-as-read', 
            emailIds: [email.id] 
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          // Update local state
          setEmails(prevEmails => 
            prevEmails.map(e => 
              e.id === email.id ? { ...e, read: true } : e
            )
          );
          alert(`✅ ${data.message}`);
        } else {
          alert(`❌ Failed to mark email as read: ${data.error}`);
        }
      } catch (error) {
        console.error('Error marking email as read:', error);
        alert('❌ Failed to mark email as read. Please try again.');
      }
    } else if (action === 'bulk-mark-as-read') {
      try {
        const response = await fetch('/api/emails', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'mark-as-read', 
            emailIds: emailIds || [] 
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          // Update local state for bulk action
          setEmails(prevEmails => 
            prevEmails.map(e => 
              (emailIds || []).includes(e.id) ? { ...e, read: true } : e
            )
          );
          alert(`✅ ${data.message}`);
        } else {
          alert(`❌ Failed to mark emails as read: ${data.error}`);
        }
      } catch (error) {
        console.error('Error marking emails as read:', error);
        alert('❌ Failed to mark emails as read. Please try again.');
      }
    } else {
      console.log('Email action:', action, email);
    }
  };

  const filteredEmails = emails.filter(email => {
    if (filter === 'all') return true;
    if (filter === 'high') return email.priority.toLowerCase() === 'high';
    if (filter === 'medium') return email.priority.toLowerCase() === 'medium' || email.priority.toLowerCase() === 'normal';
    if (filter === 'low') return email.priority.toLowerCase() === 'low';
    if (filter === 'unread') return !email.read;
    if (filter === 'read') return email.read;
    if (filter === 'starred') return email.starred;
    if (filter === 'personal') return email.label.toLowerCase() === 'personal';
    if (filter === 'work') return email.label.toLowerCase() === 'work';
    if (filter === 'promotional') return email.label.toLowerCase() === 'promotional';
    if (filter === 'other') return !['personal', 'work', 'promotional'].includes(email.label.toLowerCase());
    return email.label.toLowerCase() === filter;
  });


  if (!session) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate">Accessing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-mist page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 nav-blur shadow-luxury">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Brand />
            </motion.div>
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="luxury-ghost-button px-4 py-2 rounded-md font-medium"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Dashboard
            </motion.button>
          </div>
        </div>
      </nav>

      <div className="flex h-screen bg-gray-50">
        {/* Modern Sidebar */}
        <EmailSidebar 
          emails={emails}
          activeFilter={filter}
          onFilterChange={setFilter}
          className="h-full"
        />

        {/* Main Content */}
        <motion.div 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Your AI-Processed Emails
              </h1>
              <p className="text-gray-600">
                {filteredEmails.length} of {emails.length} emails shown
              </p>
            </div>

            {/* Email List */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your emails...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No emails found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {emails.length === 0 
                    ? 'Click "Sync Emails" on your dashboard to process emails with AI'
                    : `No emails match the current filter. Try selecting a different category or priority level.`
                  }
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  ← Return to Dashboard
                </button>
              </div>
            ) : (
              <ModernEmailList 
                emails={filteredEmails.map(email => ({
                  id: email.id,
                  sender: email.sender,
                  senderEmail: email.sender.includes('@') ? email.sender.split('<')[1]?.replace('>', '') : undefined,
                  subject: email.subject,
                  summary: email.summary,
                  fullContent: email.snippet,
                  priority: email.priority.toLowerCase() as 'high' | 'medium' | 'low' | 'normal',
                  categories: [email.label],
                  date: email.createdAt,
                  read: email.read,
                  starred: email.starred,
                  suggestedReply: email.suggestedReply
                }))}
                onEmailClick={(email) => console.log('Email clicked:', email)}
                onEmailAction={handleEmailAction}
              />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}