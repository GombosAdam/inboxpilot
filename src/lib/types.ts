export type Email = {
  id: string;
  from: string;
  subject: string;
  date: string; // ISO
  priority: 'low' | 'medium' | 'high';
  categories: ('personal'|'work'|'promotional'|'finance'|'travel')[];
  summary: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  blurb: string;
  items: string[];
  featured?: boolean;
};

export type Feature = {
  title: string;
  body: string;
  icon?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  title: string;
  avatar?: string;
};