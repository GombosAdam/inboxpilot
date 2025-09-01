import Image from 'next/image';

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}

export function ScreenshotFrame({ src, alt, caption, className = '' }: ScreenshotFrameProps) {
  return (
    <div className={className}>
      <div className="rounded-lg border border-line bg-white p-2 shadow-subtle">
        <Image 
          src={src} 
          alt={alt} 
          width={600} 
          height={400}
          className="rounded w-full h-auto"
        />
      </div>
      {caption && (
        <p className="text-sm text-slate text-center mt-3">{caption}</p>
      )}
    </div>
  );
}