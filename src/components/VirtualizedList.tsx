import { List, type RowComponentProps } from "react-window";
import type { Character } from "./types";
import { useRouter } from "@tanstack/react-router";
import { useCharacters } from "../hooks/useCharacter";

const ROW_HEIGHT = 72;
const PAGE_SIZE = 10; // API default page size (use skeleton rows of this size while loading)

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

const STATUS_STYLES: Record<string, { dot: string; badge: string }> = {
  Alive: {
    dot: "#10b981",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  Dead: {
    dot: "#f43f5e",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  },
  unknown: {
    dot: "#94a3b8",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

function StatusBadge({ status }: { status: Character["status"] }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.badge}`}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}

function SkeletonRow({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style}>
      <div className="flex items-center gap-3 h-full px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="flex-1 min-w-0 py-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2 animate-pulse" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-2 animate-pulse" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function CharacterRow({
  index,
  data,
  style,
}: RowComponentProps<{ data: (Character | null)[] }>) {
  const character = data[index] as Character | null;
  const router = useRouter();

  // subtle per-row transition when the row's data changes.
  // When react-window reuses DOM nodes between pages, toggling opacity/transform
  // helps visually indicate content replacement. We render a SkeletonRow
  // as a placeholder when character is null; otherwise we render the real row
  // wrapped in a small transition container that updates styles when the data changes.
  const visible = Boolean(character);
  const rowTransitionStyle: React.CSSProperties = {
    transition: "opacity 260ms ease, transform 260ms ease",
    opacity: visible ? 1 : 0.6,
    transform: visible ? "translateY(0px)" : "translateY(4px)",
  };

  if (!character) return <SkeletonRow style={style} />;

  const episodes = Array.isArray(character.episode)
    ? character.episode.length
    : 0;
  const dot = STATUS_STYLES[character.status]?.dot ?? "#94a3b8";

  return (
    <div style={style}>
      <div style={rowTransitionStyle}>
        <article
          className="group flex items-center gap-3 h-full px-4 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors"
          tabIndex={0}
          role="button"
          aria-label={`View details for ${character.name}`}
          onClick={() =>
            router.navigate({
              to: "/character/$id",
              params: { id: character.id },
            })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              router.navigate({
                to: "/character/$id",
                params: { id: character.id },
              });
          }}
        >
          <div className="w-full flex items-center gap-3 py-2 rounded-md group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={character.image}
                alt={character.name}
                className="w-10 h-10 rounded-lg object-cover"
                loading="lazy"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900"
                style={{ background: dot }}
              />
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {character.name}
                </span>
                <StatusBadge status={character.status} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span>{character.species}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span>{character.gender}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="truncate max-w-[180px]">
                  {character.origin?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* Episodes + date */}
            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                {episodes}
                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">
                  ep
                </span>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                {formatDate(character.created)}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function VirtualizedList({
  filter,
  sort,
}: {
  filter?: {
    name?: string;
    status?: "Alive" | "Dead" | "unknown";
    species?: string;
    type?: string;
    gender?: string;
  };
  sort?: "name" | "created" | null;
} = {}) {
  const {
    items,
    loading,
    isPageLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    goNext,
    goPrev,
    setPage,
  } = useCharacters({ initialPage: 1, filter, sort });

  // show a full-page spinner only for the very first initial load when there are no items yet.
  const isInitialLoad = loading && (!items || items.length === 0);

  if (isInitialLoad)
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-400 dark:text-slate-500">
        Loading characters…
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-sm text-rose-500">
        {error.message}
      </div>
    );

  return (
    <div className="w-full">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Character
        </span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Episodes
        </span>
      </div>

      {/* Condensed modern pagination controller */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium">{totalCount ?? "—"}</span>
            <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
              total • Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages ?? "—"}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => goPrev()}
              disabled={currentPage <= 1}
              aria-disabled={currentPage <= 1}
              className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm hover:shadow-sm disabled:opacity-50 transition flex items-center gap-2"
              aria-label="Previous page"
            >
              {isPageLoading ? (
                <svg
                  className="w-4 h-4 animate-spin text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity="0.25"
                  ></circle>
                  <path
                    d="M22 12a10 10 0 00-10-10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  ></path>
                </svg>
              ) : null}
              <span>Prev</span>
            </button>

            {/* Condensed page range with ellipses */}
            <nav aria-label="Pagination" className="flex items-center gap-2">
              {totalPages ? (
                (() => {
                  const pagesToShow: Array<
                    number | "left-ellipsis" | "right-ellipsis"
                  > = [];
                  const total = totalPages;
                  const current = currentPage;
                  const delta = 1; // show neighbors
                  const left = Math.max(1, current - delta);
                  const right = Math.min(total, current + delta);

                  if (left > 1) {
                    pagesToShow.push(1);
                    if (left > 2) pagesToShow.push("left-ellipsis");
                  }

                  for (let p = left; p <= right; p++) pagesToShow.push(p);

                  if (right < total) {
                    if (right < total - 1) pagesToShow.push("right-ellipsis");
                    pagesToShow.push(total);
                  }

                  return pagesToShow.map((v, idx) => {
                    if (v === "left-ellipsis" || v === "right-ellipsis") {
                      return (
                        <span
                          key={`ell-${idx}`}
                          className="px-2 text-sm text-slate-400 dark:text-slate-500"
                        >
                          …
                        </span>
                      );
                    }
                    const page = v as number;
                    const active = page === current;
                    return (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        aria-current={active ? "page" : undefined}
                        aria-label={`Go to page ${page}`}
                        className={`min-w-[36px] px-3 py-1 text-sm rounded-md border ${
                          active
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-sm"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()
              ) : (
                <span className="px-2 text-sm text-slate-400">…</span>
              )}
            </nav>

            <button
              onClick={() => goNext()}
              disabled={totalPages ? currentPage >= totalPages : false}
              aria-disabled={totalPages ? currentPage >= totalPages : false}
              className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm hover:shadow-sm disabled:opacity-50 transition flex items-center gap-2"
              aria-label="Next page"
            >
              {isPageLoading ? (
                <svg
                  className="w-4 h-4 animate-spin text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeOpacity="0.25"
                  ></circle>
                  <path
                    d="M2 12a10 10 0 0010-10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  ></path>
                </svg>
              ) : null}
              <span>Next</span>
            </button>
          </div>
        </div>
      </div>

      <div role="list" aria-label="Rick and Morty characters">
        <List
          rowComponent={CharacterRow}
          rowCount={isPageLoading ? PAGE_SIZE : items.length}
          rowHeight={ROW_HEIGHT}
          // if page-loading show PAGE_SIZE skeleton rows (null placeholders)
          rowProps={{
            data: isPageLoading ? new Array(PAGE_SIZE).fill(null) : items,
          }}
          style={{ height: 600, width: "100%" }}
        />
      </div>
    </div>
  );
}
