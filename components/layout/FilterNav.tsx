'use client';
import { useState, useEffect, useRef } from 'react';

const filters = ['All', 'Music', 'Podcasts'];

interface FilterNavProps {
  bgColor?: string;
  onFilterChange?: (filter: string) => void;
}

export default function FilterNav({ bgColor = '#121212', onFilterChange }: FilterNavProps) {
  const [active, setActive] = useState('All');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = navRef.current?.closest('main') || window;
    
    const handleScroll = () => {
      const scrollTop = container instanceof Window 
        ? window.scrollY 
        : (container as Element).scrollTop;
      setIsSticky(scrollTop > 10);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilter = (f: string) => {
    setActive(f);
    onFilterChange?.(f);
  };

  return (
    <div
      ref={navRef}
      className="sticky top-0 z-30 transition-all duration-500"
      style={{
        background: `linear-gradient(to bottom, ${bgColor} 0%, ${bgColor}cc 60%, transparent 100%)`,
        backdropFilter: isSticky ? 'blur(12px)' : 'none',
      }}
    >
      <div className="flex items-center gap-2 px-6 py-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
              ${active === f
                ? 'bg-white text-black'
                : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
              }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}