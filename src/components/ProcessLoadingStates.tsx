'use client';
import { FC, useEffect, useState } from 'react';
import { LoadingSpinner, LoadingDots } from './LoadingSpinner';

interface SyncLoadingProps {
  step?: 'connecting' | 'fetching' | 'processing' | 'saving' | 'complete';
  progress?: number;
  emailCount?: number;
}

export const SyncLoadingState: FC<SyncLoadingProps> = ({ 
  step = 'connecting', 
  progress = 0,
  emailCount = 0 
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const stepInfo = {
    connecting: {
      icon: '🔗',
      title: 'Connecting to Gmail',
      description: 'Establishing secure connection with your Gmail account',
      color: 'from-blue-500 to-indigo-600'
    },
    fetching: {
      icon: '📥',
      title: 'Fetching Emails',
      description: 'Retrieving unread emails from the last 3 days',
      color: 'from-purple-500 to-pink-600'
    },
    processing: {
      icon: '🤖',
      title: 'AI Processing',
      description: `Analyzing ${emailCount} emails with Claude AI`,
      color: 'from-green-500 to-emerald-600'
    },
    saving: {
      icon: '💾',
      title: 'Saving Results',
      description: 'Storing AI-generated summaries and insights',
      color: 'from-orange-500 to-red-600'
    },
    complete: {
      icon: '✅',
      title: 'Sync Complete',
      description: 'All emails have been processed successfully!',
      color: 'from-green-600 to-teal-600'
    }
  };

  const currentStep = stepInfo[step];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 max-w-md mx-auto">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${currentStep.color} flex items-center justify-center shadow-lg`}>
            <span className="text-3xl animate-bounce">{currentStep.icon}</span>
          </div>
          {step !== 'complete' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <LoadingSpinner size="sm" color="white" className="bg-white rounded-full p-1" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {currentStep.title}{step !== 'complete' && dots}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6">{currentStep.description}</p>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${currentStep.color} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2">
          {Object.keys(stepInfo).slice(0, -1).map((stepKey, index) => (
            <div
              key={stepKey}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                Object.keys(stepInfo).indexOf(step) >= index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface AnalyticsLoadingProps {
  message?: string;
}

export const AnalyticsLoadingState: FC<AnalyticsLoadingProps> = ({ 
  message = 'Generating insights...' 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm p-16 text-center border border-gray-200">
      <div className="relative mb-8">
        {/* Animated Chart Icon */}
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl">📊</span>
        </div>
        
        {/* Pulsing Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-ping"></div>
          <div className="absolute w-24 h-24 border-2 border-purple-200 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Your Data</h3>
      <p className="text-slate-600 mb-6">{message}</p>
      
      {/* Animated Bars */}
      <div className="flex justify-center items-end space-x-1 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-2 bg-gradient-to-t from-indigo-400 to-purple-600 rounded-full animate-pulse"
            style={{ 
              height: `${Math.random() * 30 + 20}px`,
              animationDelay: `${i * 0.1}s` 
            }}
          />
        ))}
      </div>

      <LoadingDots color="primary" size="md" />
    </div>
  );
};

interface AuthLoadingProps {
  stage?: 'redirecting' | 'authenticating' | 'completing';
}

export const AuthLoadingState: FC<AuthLoadingProps> = ({ stage = 'redirecting' }) => {
  const stageInfo = {
    redirecting: {
      icon: '🚀',
      title: 'Redirecting to Google',
      description: 'Taking you to Google\'s secure authentication page'
    },
    authenticating: {
      icon: '🔐',
      title: 'Authenticating',
      description: 'Verifying your credentials with Google'
    },
    completing: {
      icon: '✨',
      title: 'Completing Setup',
      description: 'Finalizing your account connection'
    }
  };

  const current = stageInfo[stage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-white/50 text-center max-w-md">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl animate-pulse">{current.icon}</span>
          </div>
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">{current.title}</h2>
        <p className="text-gray-600 mb-8">{current.description}</p>

        <div className="flex justify-center">
          <LoadingSpinner size="lg" color="primary" />
        </div>

        <p className="text-sm text-gray-500 mt-6">
          This may take a few moments...
        </p>
      </div>
    </div>
  );
};

interface EmailProcessingProps {
  currentEmail?: number;
  totalEmails?: number;
  currentSubject?: string;
}

export const EmailProcessingState: FC<EmailProcessingProps> = ({
  currentEmail = 0,
  totalEmails = 0,
  currentSubject = ''
}) => {
  const progress = totalEmails > 0 ? (currentEmail / totalEmails) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-2xl animate-bounce">🧠</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">AI Processing Emails</h3>
        <p className="text-gray-600">
          Processing email {currentEmail} of {totalEmails}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div 
          className="h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-300 ease-out flex items-center justify-end pr-2"
          style={{ width: `${progress}%` }}
        >
          <span className="text-white text-xs font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Current Email Info */}
      {currentSubject && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Currently processing:</p>
          <p className="font-medium text-gray-900 truncate">{currentSubject}</p>
        </div>
      )}

      {/* Processing Steps */}
      <div className="flex justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <LoadingDots size="sm" color="primary" />
          <span className="text-gray-600">Analyzing content</span>
        </div>
      </div>
    </div>
  );
};

interface PageLoadingProps {
  title?: string;
  description?: string;
  icon?: string;
}

export const PageLoadingState: FC<PageLoadingProps> = ({
  title = 'Loading',
  description = 'Please wait while we prepare your content',
  icon = '⏳'
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-white text-4xl animate-pulse">{icon}</span>
          </div>
          
          {/* Orbiting Elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-blue-200 rounded-full animate-spin" style={{ animationDuration: '3s' }}>
              <div className="w-3 h-3 bg-blue-500 rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border border-purple-200 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
              <div className="w-2 h-2 bg-purple-500 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">{description}</p>
        
        <LoadingSpinner size="lg" color="primary" />
      </div>
    </div>
  );
};