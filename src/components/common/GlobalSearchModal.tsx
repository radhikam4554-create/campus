import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, FileText, Bell, Users, GraduationCap, ArrowRight } from 'lucide-react';
import api from '../../api/client.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  link: string;
  id: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.data.success) {
          setResults(res.data.data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectResult = (result: SearchResult) => {
    onClose();
    if (result.type === 'Notice') onNavigate('notices');
    else if (result.type === 'Assignment') onNavigate('assignments');
    else if (result.type === 'Subject') onNavigate('timetable');
    else if (result.type === 'Student') onNavigate('admin-students');
    else if (result.type === 'Faculty') onNavigate('admin-faculty');
    else onNavigate('dashboard');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Notice': return Bell;
      case 'Assignment': return FileText;
      case 'Subject': return BookOpen;
      case 'Student': return GraduationCap;
      case 'Faculty': return Users;
      default: return ArrowRight;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, assignments, faculty, notices..."
            className="w-full px-3 py-4 text-sm bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="py-6 text-center text-xs text-slate-400">
              Searching campus directory...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching results found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                Quick suggestions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['DBMS', 'Operating Systems', 'Mid-Sem Exam', 'Placement Drive', 'Assignments'].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((r) => {
                const Icon = getIcon(r.type);
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectResult(r)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {r.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600">
                      {r.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search records across campus</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
