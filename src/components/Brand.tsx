import Link from 'next/link';

interface BrandProps {
  className?: string;
}

export function Brand({ className = "" }: BrandProps) {
  return (
    <Link href="/" className={`group flex items-center ${className}`}>
      <span className="relative">
        <span className="text-2xl font-light tracking-tight text-slate-800">
          Inbox
        </span>
        <span className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Pilot
        </span>
        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-500 ease-out"></span>
      </span>
    </Link>
  );
}