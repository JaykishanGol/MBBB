import { Film, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Film className="h-8 w-8 text-primary" />
        <MapPin className="absolute -bottom-1 -right-1 h-4 w-4 text-accent fill-accent" />
      </div>
      <span className="text-2xl font-bold font-headline tracking-tighter">MovieSpot</span>
    </div>
  );
};
