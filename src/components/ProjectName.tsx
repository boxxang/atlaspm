'use client';

import { useRef, useState } from 'react';

/**
 * AtlasPM is the product; this is the project. Click swaps the button for an
 * input; blur/Enter commits, Escape reverts. Ported from initProjectName().
 */
export function ProjectName({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  if (!editing) {
    return (
      <button
        id="project-name"
        title="Click to rename project"
        onClick={() => {
          setDraft(value);
          cancelled.current = false;
          setEditing(true);
        }}
      >
        {value}
      </button>
    );
  }

  return (
    <input
      id="project-name-input"
      autoFocus
      value={draft}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (!cancelled.current) onChange(draft.trim() || value);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
    />
  );
}
