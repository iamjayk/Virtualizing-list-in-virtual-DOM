import { useParams, useRouter } from "@tanstack/react-router";
import { Fragment } from "react";
import { useCharacter } from "../hooks/useCharacter";
import classNames from "classnames";

export default function CharacterDetail() {
  const params = useParams({ strict: false }) as { id?: string };
  const router = useRouter();
  const id = params.id ?? "";

  const Skeleton = ({ className = "" }: { className?: string }) => (
    <div
      className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded ${className}`}
    />
  );

  const { data, loading, error } = useCharacter(id);

  const BackButton = () => (
    <button
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6"
      onClick={() => router.navigate({ to: "/" })}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back to list
    </button>
  );

  if (!id)
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            No character specified
          </p>
          <p className="text-sm text-slate-500">
            Use a path like{" "}
            <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">
              /character/1
            </code>
          </p>
        </div>
      </main>
    );

  if (loading)
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 transition-colors">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-start gap-5 p-6 pb-5">
              <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
              <div className="flex-1 pt-1">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 mx-6" />
            <div className="grid grid-cols-2 px-6 py-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`py-3 ${i % 2 === 0 ? "pr-4" : "pl-4"}`}
                >
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );

  const ErrorOrEmpty = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) => (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {title}
        </p>
        <p className="text-sm text-slate-500 mb-4">{message}</p>
        <button
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline underline-offset-2 transition-colors"
          onClick={() => router.navigate({ to: "/" })}
        >
          Back to list
        </button>
      </div>
    </main>
  );

  if (error)
    return <ErrorOrEmpty title="Failed to load" message={error.message} />;

  const character = data?.character;
  if (!character)
    return (
      <ErrorOrEmpty
        title="Character not found"
        message={`No character returned for id ${id}.`}
      />
    );

  const statusStyles: Record<string, string> = {
    Alive:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    Dead: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
    unknown:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  const fields = [
    { label: "Origin", value: character.origin?.name || "Unknown" },
    { label: "Last location", value: character.location?.name || "Unknown" },
    { label: "Species", value: character.species },
    {
      label: "Created",
      value: new Date(character.created).toLocaleDateString("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    },
    ...(character.type ? [{ label: "Type", value: character.type }] : []),
    { label: "Gender", value: character.gender },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 transition-colors">
      <div className="max-w-2xl mx-auto">
        <BackButton />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400" />

          {/* Header */}
          <div className="flex items-start gap-5 p-6 pb-5">
            <img
              src={character.image}
              alt={character.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h1 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
                  {character.name}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    statusStyles[character.status] ?? statusStyles.unknown
                  }`}
                >
                  {character.status}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[character.species, character.gender, character.type]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 mx-6" />

          {/* Details grid */}
          <div className="grid grid-cols-2 px-6 py-5 gap-y-0">
            {fields.map(({ label, value }, i) => (
              <div
                key={label}
                className={classNames(
                  "py-3",
                  i % 2 === 0
                    ? "pr-4 border-r border-slate-100 dark:border-slate-800"
                    : "pl-4",
                  i < fields.length - 2
                    ? "border-b border-slate-100 dark:border-slate-800"
                    : ""
                )}
              >
                <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 mx-6" />

          {/* Episodes */}
          <div className="p-6 pt-5">
            <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Episodes
            </p>
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-left">
                    <th className="px-3 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 w-24">
                      Code
                    </th>
                    <th className="px-3 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                      Name
                    </th>
                    <th className="px-3 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 hidden sm:table-cell">
                      Air date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {character.episode.length > 0 ? (
                    character.episode.map((ep, idx) => (
                      <Fragment key={ep.id}>
                        <tr
                          className={
                            idx % 2 === 0
                              ? ""
                              : "bg-slate-50/50 dark:bg-slate-800/30"
                          }
                        >
                          <td className="px-3 py-2.5">
                            <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                              {ep.episode}
                            </code>
                          </td>
                          <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200">
                            {ep.name}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                            {ep.air_date}
                          </td>
                        </tr>
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-6 text-center text-sm text-slate-400"
                      >
                        No episodes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
