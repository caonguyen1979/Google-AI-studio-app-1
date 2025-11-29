import React from 'react';
import { Apple, Star, Cat, Cookie } from 'lucide-react';

interface VisualCounterProps {
  count: number;
  type: 'apples' | 'stars' | 'cats' | 'cookies';
  color?: string;
  className?: string;
}

const VisualCounter: React.FC<VisualCounterProps> = ({ count, type, color, className = "" }) => {
  const getIcon = () => {
    switch (type) {
      case 'apples': return <Apple className="w-8 h-8 text-red-500 fill-red-200" />;
      case 'stars': return <Star className="w-8 h-8 text-yellow-400 fill-yellow-200" />;
      case 'cats': return <Cat className="w-8 h-8 text-orange-400 fill-orange-100" />;
      case 'cookies': return <Cookie className="w-8 h-8 text-amber-700 fill-amber-200" />;
      default: return <Apple className="w-8 h-8 text-red-500" />;
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 justify-center max-w-[200px] ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-in zoom-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
          {getIcon()}
        </div>
      ))}
    </div>
  );
};

export default VisualCounter;