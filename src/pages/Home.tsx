import { useState, useMemo, useEffect } from "react";
import VirtualizedList from "../components/VirtualizedList";

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [status, setStatus] = useState<"" | "Alive" | "Dead" | "unknown">("");
  const [sort, setSort] = useState<"name" | "created">("name");

  // Debounce search input so we don't re-query on every keystroke.
  // `isDebouncing` is true while the timeout is pending and false once the
  // debounced value is applied (or cleared).
  useEffect(() => {
    // If the query is already equal to the debounced value, nothing to do.
    if (query.trim() === debouncedQuery) {
      setIsDebouncing(false);
      return;
    }
    setIsDebouncing(true);
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsDebouncing(false);
    }, 300);
    return () => {
      clearTimeout(id);
      setIsDebouncing(false);
    };
  }, [query]);

  const activeFilters = useMemo(() => {
    const parts: string[] = [];
    if (query.trim()) parts.push(`"${query.trim()}"`);
    if (status) parts.push(status.toLowerCase());
    return parts.length ? parts.join(" · ") : "All characters";
  }, [query, status]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">
              Rick &amp; Morty Explorer
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Browse characters, episodes &amp; locations
            </p>
          </div>
          {/* header navigation removed — simplified header for this demo */}
        </div>

        {/* Card — matches CharacterDetail card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 min-w-[160px]">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search characters..."
                aria-label="Search characters"
                className="w-full pl-8 pr-10 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-colors"
              />
              {/* Debounce indicator (small spinner on the right while waiting) */}
              {isDebouncing ? (
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeOpacity="0.25"
                  />
                  <path
                    d="M22 12a10 10 0 00-10-10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : null}
            </div>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  (e.target.value as "" | "Alive" | "Dead" | "unknown") || ""
                )
              }
              aria-label="Filter by status"
              className="py-1.5 px-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-colors"
            >
              <option value="">All status</option>
              <option value="Alive">Alive</option>
              <option value="Dead">Dead</option>
              <option value="unknown">Unknown</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "name" | "created")}
              aria-label="Sort"
              className="py-1.5 px-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-colors"
            >
              <option value="name">Sort: name</option>
              <option value="created">Sort: created</option>
            </select>
          </div>

          {/* Active filters */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {activeFilters}
            </span>
          </div>

          {/* List */}
          <section id="characters">
            <VirtualizedList
              filter={{ name: debouncedQuery, status: status || undefined }}
              sort={sort}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
