import React, { useEffect, useState } from 'react';
import { List, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItem {
  id: string;
  text: string;
  level: number;
}

interface PRDNavigatorProps {
  content: string;
}

export const PRDNavigator: React.FC<PRDNavigatorProps> = ({ content }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse markdown headings
    const lines = content.split('\n');
    const items: NavItem[] = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,2})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level });
      }
    });
    
    setNavItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    const headings = document.querySelectorAll('h1, h2');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [navItems]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (navItems.length === 0) return null;

  return (
    <div className="hidden xl:block fixed right-4 top-24 w-64 bg-dashboard-card/30 backdrop-blur-sm border border-dashboard-border rounded-xl p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dashboard-border">
        <List className="w-4 h-4 text-accent-blue" />
        <span className="text-[10px] font-bold text-dashboard-muted uppercase tracking-widest">Section Navigator</span>
      </div>
      
      <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={cn(
              "flex items-start gap-2 w-full text-left transition-all duration-200 group py-1.5",
              item.level === 1 ? "font-bold text-xs" : "pl-4 text-[11px]",
              activeId === item.id 
                ? "text-accent-blue" 
                : "text-dashboard-subtle hover:text-white"
            )}
          >
            <ChevronRight className={cn(
              "w-3 h-3 mt-0.5 shrink-0 transition-transform",
              activeId === item.id ? "rotate-90 opacity-100" : "opacity-0 group-hover:opacity-100"
            )} />
            <span className="line-clamp-2">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
