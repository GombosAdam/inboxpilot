import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, body, className = '' }: FeatureCardProps) {
  return (
    <div className={`rounded-lg border border-line bg-white p-6 hover:shadow-sm transition-shadow ${className}`}>
      <Icon className="h-5 w-5 text-slate mb-4" />
      <h3 className="font-semibold text-ink mb-2">{title}</h3>
      <p className="text-slate">{body}</p>
    </div>
  );
}