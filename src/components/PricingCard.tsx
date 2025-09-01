import { CTAButton } from './CTAButton';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  blurb: string;
  items: string[];
  featured?: boolean;
  ctaText?: string;
  ctaData?: string;
}

export function PricingCard({ 
  name, 
  price, 
  blurb, 
  items, 
  featured = false,
  ctaText = "Get Started",
  ctaData
}: PricingCardProps) {
  return (
    <div className={`rounded-lg border bg-white p-6 ${
      featured 
        ? 'border-blue shadow-subtle hover:shadow-lg transition-shadow' 
        : 'border-line hover:shadow-sm transition-shadow'
    }`}>
      <div className="mb-6">
        <h3 className="font-semibold text-ink mb-2">{name}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-ink">{price}</span>
          {price !== '$0' && <span className="text-slate ml-1">{blurb}</span>}
        </div>
        {price === '$0' && <p className="text-sm text-slate mt-1">{blurb}</p>}
      </div>
      
      <ul className="space-y-3 mb-6">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-4 w-4 text-success mr-3 flex-shrink-0" />
            <span className="text-slate">{item}</span>
          </li>
        ))}
      </ul>
      
      <CTAButton 
        variant={featured ? 'primary' : 'ghost'}
        className="w-full"
        data-cta={ctaData}
      >
        {ctaText}
      </CTAButton>
    </div>
  );
}