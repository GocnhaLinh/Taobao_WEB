import React from 'react';

/**
 * Reusable component that highlights matching search query text
 * with a amber/yellow <mark> background.
 */
export const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query?.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-200/60 dark:bg-amber-500/30 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};