import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

/** Debounced search input. Calls onChange only after the user pauses typing. */
export function SearchBar({ value, onChange, placeholder = 'Search…', delay = 350 }: SearchBarProps) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  useEffect(() => {
    if (debounced !== latest.current.value) latest.current.onChange(debounced);
  }, [debounced]);

  // Clear the box when the parent resets the search.
  useEffect(() => {
    if (value === '') setText('');
  }, [value]);

  return (
    <div className="searchbar">
      <Icon name="search" size={16} className="control-icon" />
      <input
        type="search"
        className="input input-with-icon"
        value={text}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
