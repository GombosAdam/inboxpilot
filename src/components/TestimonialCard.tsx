interface TestimonialCardProps {
  quote: string;
  author: string;
  title: string;
  avatar?: string;
}

export function TestimonialCard({ quote, author, title }: TestimonialCardProps) {
  return (
    <div className="rounded-lg border border-line bg-white p-6">
      <blockquote className="text-ink mb-4">"{quote}"</blockquote>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-line rounded-full flex items-center justify-center mr-3">
          <span className="text-slate text-sm font-medium">{author[0]}</span>
        </div>
        <div>
          <div className="font-medium text-ink">{author}</div>
          <div className="text-sm text-slate">{title}</div>
        </div>
      </div>
    </div>
  );
}