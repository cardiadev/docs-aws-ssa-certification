'use client';
import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;
    import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      });
      m.default
        .render('mermaid-' + Math.random().toString(36).slice(2), chart)
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        });
    });
  }, [chart, resolvedTheme]);

  return <div ref={ref} className="my-6 overflow-x-auto" />;
}
