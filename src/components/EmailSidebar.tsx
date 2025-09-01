'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  ChevronLeft,
  ChevronRight,
  Hash,
  AlertCircle,
  Clock,
  CheckCircle2,
  User,
  Briefcase,
  Megaphone,
  Archive,
  Star,
  Mail,
  MailOpen,
  Search,
  Command
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  shortcut?: string;
  color?: string;
}

interface EmailSidebarProps {
  emails: any[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

export function EmailSidebar({ emails, activeFilter, onFilterChange, className = '' }: EmailSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Calculate counts based on actual email data
  const calculateCounts = useCallback(() => {
    return {
      all: emails.length,
      high: emails.filter(e => e.priority?.toLowerCase() === 'high').length,
      medium: emails.filter(e => e.priority?.toLowerCase() === 'medium' || e.priority?.toLowerCase() === 'normal').length,
      low: emails.filter(e => e.priority?.toLowerCase() === 'low').length,
      unread: emails.filter(e => !e.read).length,
      read: emails.filter(e => e.read).length,
      starred: emails.filter(e => e.starred).length,
      personal: emails.filter(e => e.label?.toLowerCase() === 'personal').length,
      work: emails.filter(e => e.label?.toLowerCase() === 'work').length,
      promotional: emails.filter(e => e.label?.toLowerCase() === 'promotional').length,
      other: emails.filter(e => !['personal', 'work', 'promotional'].includes(e.label?.toLowerCase())).length,
    };
  }, [emails]);

  const counts = calculateCounts();

  const filterGroups = [
    {
      title: 'Overview',
      filters: [
        { id: 'all', label: 'All emails', icon: <Inbox className="w-4 h-4" />, count: counts.all, shortcut: '1', color: 'text-gray-700' }
      ]
    },
    {
      title: 'Priority',
      filters: [
        { id: 'high', label: 'High', icon: <AlertCircle className="w-4 h-4" />, count: counts.high, shortcut: '2', color: 'text-red-600' },
        { id: 'medium', label: 'Medium', icon: <Clock className="w-4 h-4" />, count: counts.medium, shortcut: '3', color: 'text-yellow-600' },
        { id: 'low', label: 'Low', icon: <CheckCircle2 className="w-4 h-4" />, count: counts.low, shortcut: '4', color: 'text-green-600' }
      ]
    },
    {
      title: 'Categories',
      filters: [
        { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" />, count: counts.personal, shortcut: '5', color: 'text-blue-600' },
        { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" />, count: counts.work, shortcut: '6', color: 'text-purple-600' },
        { id: 'promotional', label: 'Promotional', icon: <Megaphone className="w-4 h-4" />, count: counts.promotional, shortcut: '7', color: 'text-pink-600' },
        { id: 'other', label: 'Other', icon: <Archive className="w-4 h-4" />, count: counts.other, shortcut: '8', color: 'text-gray-600' }
      ]
    },
    {
      title: 'Status',
      filters: [
        { id: 'unread', label: 'Unread', icon: <Mail className="w-4 h-4" />, count: counts.unread, shortcut: '9', color: 'text-indigo-600' },
        { id: 'read', label: 'Read', icon: <MailOpen className="w-4 h-4" />, count: counts.read, color: 'text-gray-500' },
        { id: 'starred', label: 'Starred', icon: <Star className="w-4 h-4" />, count: counts.starred, shortcut: '0', color: 'text-yellow-500' }
      ]
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Show/hide shortcuts guide with '?'
      if (e.key === '?') {
        setShowShortcuts(!showShortcuts);
        return;
      }

      // Toggle sidebar with 'cmd/ctrl + \'
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        setIsCollapsed(!isCollapsed);
        return;
      }

      // Filter shortcuts (1-9, 0)
      const shortcuts: { [key: string]: string } = {
        '1': 'all',
        '2': 'high',
        '3': 'medium',
        '4': 'low',
        '5': 'personal',
        '6': 'work',
        '7': 'promotional',
        '8': 'other',
        '9': 'unread',
        '0': 'starred'
      };

      if (shortcuts[e.key]) {
        onFilterChange(shortcuts[e.key]);
      }

      // Focus search with '/'
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('sidebar-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isCollapsed, showShortcuts, onFilterChange]);

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '60px' }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        className={`relative bg-white border-r border-gray-200 flex flex-col h-full ${className}`}
        initial="expanded"
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  className="flex items-center gap-2"
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Filters</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
              )}
            </motion.button>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="mt-3 relative"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  id="sidebar-search"
                  type="text"
                  placeholder="Search filters..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Groups */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {filterGroups.map((group, groupIndex) => {
            const filteredGroup = {
              ...group,
              filters: group.filters.filter(f => 
                f.label.toLowerCase().includes(searchQuery.toLowerCase())
              )
            };

            if (filteredGroup.filters.length === 0) return null;

            return (
              <div key={group.title} className="mb-6">
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.h3
                      className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      {group.title}
                    </motion.h3>
                  )}
                </AnimatePresence>

                <div className="px-2">
                  {filteredGroup.filters.map((filter, index) => {
                    const isActive = activeFilter === filter.id;
                    
                    return (
                      <motion.button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                          w-full mb-1 px-2 py-2 rounded-lg flex items-center gap-3
                          transition-all duration-200 group relative
                          ${isActive 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                          }
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: groupIndex * 0.05 + index * 0.02,
                          duration: 0.2
                        }}
                        whileHover={{ x: isCollapsed ? 0 : 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-r"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}

                        {/* Icon */}
                        <span className={`${filter.color || 'text-gray-500'} ${isActive ? 'text-opacity-100' : 'text-opacity-70'}`}>
                          {filter.icon}
                        </span>

                        {/* Label and Count */}
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              className="flex items-center justify-between flex-1"
                              variants={contentVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                            >
                              <span className="text-sm font-medium">{filter.label}</span>
                              <div className="flex items-center gap-2">
                                {filter.shortcut && (
                                  <kbd className="hidden group-hover:inline-flex px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded text-gray-500">
                                    {filter.shortcut}
                                  </kbd>
                                )}
                                <span className={`
                                  px-2 py-0.5 text-xs font-medium rounded-full
                                  ${isActive 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-600'
                                  }
                                `}>
                                  {filter.count}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                            {filter.label} ({filter.count})
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - Keyboard Shortcuts */}
        <div className="p-3 border-t border-gray-100">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.button
                onClick={() => setShowShortcuts(true)}
                className="w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Command className="w-3 h-3" />
                <span>Keyboard shortcuts</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcuts(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50 w-96"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Toggle sidebar</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">⌘ \</kbd>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Search filters</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">/</kbd>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">?</kbd>
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">All emails</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">1</kbd>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">High priority</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">2</kbd>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Personal</span>
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">5</kbd>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}