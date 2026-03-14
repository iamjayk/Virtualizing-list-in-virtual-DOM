import { gql } from "@apollo/client";
import type { Character } from "../components/types";
import { useQuery } from "@apollo/client/react";
import { useState, useCallback, useEffect } from "react";

export const GET_CHARACTER_QUERY = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      status
      species
      type
      gender
      origin {
        name
      }
      location {
        name
      }
      image
      episode {
        id
        name
        episode
        air_date
      }
      created
    }
  }
`;

export const GET_CHARACTERS_QUERY = gql`
  query GetCharacters($page: Int, $filter: FilterCharacter) {
    characters(page: $page, filter: $filter) {
      info {
        count
        next
        pages
        prev
      }
      results {
        id
        name
        status
        species
        type
        gender
        origin {
          name
        }
        location {
          name
        }
        image
        episode {
          id
          name
          episode
          air_date
        }
        created
      }
    }
  }
`;

type CharacterEpisode = {
  id: string;
  name: string;
  episode: string;
  air_date: string;
};

type CharacterDetailData = {
  character: {
    id: string;
    name: string;
    status: Character["status"];
    species: string;
    type: string;
    gender: Character["gender"];
    origin: { name: string };
    location: { name: string };
    image: string;
    episode: CharacterEpisode[];
    created: string;
  } | null;
};

type CharacterDetailVars = { id: string };

export function useCharacter(id: string) {
  return useQuery<CharacterDetailData, CharacterDetailVars>(
    GET_CHARACTER_QUERY,
    {
      variables: { id },
      skip: !id,
    }
  );
}

type CharactersQueryInfo = {
  count: number;
  next: number | null;
  pages: number;
  prev: number | null;
};

type CharactersQueryResult = {
  id: string;
  name: string;
  status: Character["status"];
  species: string;
  type: string;
  gender: Character["gender"];
  origin: { name: string };
  location: { name: string };
  image: string;
  episode: CharacterEpisode[];
  created: string;
};

type CharactersQueryData = {
  characters: {
    info: CharactersQueryInfo;
    results: CharactersQueryResult[];
  };
};

/**
 * Page-based hook that returns the results for the current page only.
 * - currentPage: number
 * - items: CharactersQueryResult[]  (results of current page)
 * - goNext/goPrev: functions to change page
 * - totalCount/totalPages: metadata from API
 */
export function useCharacters(options?: {
  initialPage?: number;
  filter?: {
    name?: string;
    status?: "Alive" | "Dead" | "unknown";
    species?: string;
    type?: string;
    gender?: string;
  };
  // client-side sort key (server doesn't support sort)
  sort?: "name" | "created" | null;
}) {
  const initialPage = options?.initialPage ?? 1;
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  // Normalize filter values before sending to the API:
  // - trim name
  // - map status to the API-friendly form (lowercase 'alive'/'dead' but keep 'unknown')
  // - remove empty fields so the GraphQL variable is undefined when no filter is applied
  const normalizeFilter = (raw?: any) => {
    if (!raw) return undefined;
    const out: Record<string, any> = {};
    if (raw.name && String(raw.name).trim() !== "")
      out.name = String(raw.name).trim();
    if (raw.status && String(raw.status).trim() !== "") {
      const s = String(raw.status).trim();
      // Map 'unknown' to 'unknown', otherwise use lowercase for compatibility
      out.status = s.toLowerCase() === "unknown" ? "unknown" : s.toLowerCase();
    }
    if (raw.species && String(raw.species).trim() !== "")
      out.species = String(raw.species).trim();
    if (raw.type && String(raw.type).trim() !== "")
      out.type = String(raw.type).trim();
    if (raw.gender && String(raw.gender).trim() !== "")
      out.gender = String(raw.gender).trim();
    return Object.keys(out).length ? out : undefined;
  };

  const normalizedFilter = normalizeFilter(options?.filter);

  // Query accepts filter variable (GraphQL `FilterCharacter` input)
  const { data, loading, error, refetch } = useQuery<
    CharactersQueryData,
    { page?: number; filter?: any }
  >(GET_CHARACTERS_QUERY, {
    variables: { page: currentPage, filter: normalizedFilter ?? undefined },
    notifyOnNetworkStatusChange: true,
    // note: changing variables triggers refetch automatically
  });

  // Raw items from the API page
  const rawItems: CharactersQueryResult[] = data?.characters?.results ?? [];

  // Track page-level loading state separately so UI can show in-list skeletons
  // while navigating between pages without hiding the entire layout.
  useEffect(() => {
    setIsPageLoading(Boolean(loading));
  }, [loading]);

  const totalPages = data?.characters?.info?.pages ?? null;
  const totalCount = data?.characters?.info?.count ?? null;

  const goNext = useCallback(() => {
    if (totalPages && currentPage >= totalPages) return;
    setCurrentPage((p) => p + 1);
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Apply simple client-side sorting if requested.
  // Sorting is stable and done on the current page only.
  const sortKey = options?.sort ?? null;
  let items = rawItems;
  if (sortKey && Array.isArray(rawItems) && rawItems.length > 0) {
    items = [...rawItems].sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortKey === "created") {
        // newest first
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
      return 0;
    });
  }

  return {
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
    // expose the normalized filter for debugging or downstream use
    appliedFilter: normalizedFilter,
    refetch,
  };
}
