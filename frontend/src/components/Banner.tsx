'use client';

interface BannerProps {
  message: string;
  type?: 'info' | 'warning';
}

export default function Banner({ message, type = 'info' }: BannerProps) {
  return (
    <div className={`
      absolute top-0 w-full py-1.5 px-2 text-center text-xs font-medium
      ${type === 'info' 
        ? 'bg-blue-500/90 text-white' 
        : 'bg-yellow-500/90 text-black'
      }
    `}>
      {message}
    </div>
  );
} 