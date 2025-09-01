'use client';

import { useState } from 'react';
import { Email } from '@/lib/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface EmailTableProps {
  emails: Email[];
}

export function EmailTable({ emails }: EmailTableProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  const toggleExpanded = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  const getPriorityColor = (priority: Email['priority']) => {
    const colors = {
      high: 'bg-rose-50 text-rose-600 border-rose-200',
      medium: 'bg-amber-50 text-amber-600 border-amber-200',
      low: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    };
    return colors[priority];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-50 text-blue-600',
      work: 'bg-slate-50 text-slate-600',
      promotional: 'bg-purple-50 text-purple-600',
      finance: 'bg-green-50 text-green-600',
      travel: 'bg-sky-50 text-sky-600'
    };
    return colors[category] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="bg-white border border-line rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-mist border-b border-line">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate">Priority</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate">From</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate">Subject</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate">AI Summary</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-slate">Date</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => {
            const isExpanded = expandedEmails.has(email.id);
            return (
              <tr key={email.id} className="border-b border-line hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(email.priority)}`}>
                    {email.priority.charAt(0).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-ink">{email.from}</td>
                <td className="px-4 py-3 text-sm text-ink font-medium">{email.subject}</td>
                <td className="px-4 py-3 text-sm text-slate max-w-xs truncate">{email.summary}</td>
                <td className="px-4 py-3 text-sm text-slate">
                  {new Date(email.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleExpanded(email.id)}
                    className="text-slate hover:text-ink"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </td>
                {isExpanded && (
                  <td colSpan={6} className="px-4 py-4 bg-mist border-t border-line">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-ink mb-2">Full AI Summary</h4>
                        <p className="text-slate">{email.summary}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-ink mb-2">Categories</h4>
                        <div className="flex gap-2">
                          {email.categories.map((category) => (
                            <span 
                              key={category}
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getCategoryColor(category)}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm text-slate hover:text-ink border border-line rounded px-3 py-1">
                          Reply
                        </button>
                        <button className="text-sm text-slate hover:text-ink border border-line rounded px-3 py-1">
                          Forward
                        </button>
                        <button className="text-sm text-slate hover:text-ink border border-line rounded px-3 py-1">
                          Archive
                        </button>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}