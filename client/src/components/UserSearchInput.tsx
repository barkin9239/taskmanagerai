import { useState, useEffect, useRef } from 'react';
import { searchUsers, type UserSearchResult } from '../services/userService';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  value: UserSearchResult | null;
  onChange: (user: UserSearchResult | null) => void;
}

export default function UserSearchInput({ value, onChange }: Props) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<UserSearchResult[]>([]);
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const debouncedQuery          = useDebounce(query, 300);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch on debounced query change
  useEffect(() => {
    if (value) return;           // user already selected — don't re-query
    if (debouncedQuery.length < 1) { setResults([]); setOpen(false); return; }

    let cancelled = false;
    setLoading(true);
    searchUsers(debouncedQuery)
      .then(({ data }) => {
        if (!cancelled) { setResults(data); setOpen(data.length > 0); }
      })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery, value]);

  const handleSelect = (user: UserSearchResult) => {
    onChange(user);
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input row */}
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
        {value ? (
          /* Chip — selected user */
          <div className="flex items-center gap-2 flex-1 px-3 py-2">
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-indigo-600">
                {value.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-800 truncate">{value.email}</span>
            <span className="text-xs text-gray-400 truncate hidden sm:block">({value.name})</span>
          </div>
        ) : (
          <input
            type="email"
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (value) onChange(null); }}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder="Search by email…"
            className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            autoComplete="off"
          />
        )}

        {/* Right side: spinner or clear */}
        <div className="px-3 shrink-0">
          {loading ? (
            <svg className="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (value || query) ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((user) => (
            <li
              key={user.id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(user); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
