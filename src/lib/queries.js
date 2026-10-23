import { useQuery } from "@tanstack/react-query";
import { contentApi, learnerApi } from "../api/endpoints";

export const useEnrollments = (enabled = true) =>
  useQuery({ queryKey: ["enrollments"], queryFn: learnerApi.enrollments, enabled });

export const useTracks = (q = {}) =>
  useQuery({ queryKey: ["tracks", q], queryFn: () => contentApi.tracks({ limit: 100, ...q }) });

import { useQueries } from "@tanstack/react-query";

export const progressKey = (id) => ["progress", id];

export function useAllProgress(enrollments) {
  const results = useQueries({
    queries: (enrollments || []).map((e) => ({
      queryKey: progressKey(e.id),
      queryFn: () => learnerApi.progress(e.id),
    })),
  });
  return {
    results,
    isLoading: results.some((r) => r.isLoading),
    data: results.map((r) => r.data).filter(Boolean),
  };
}
